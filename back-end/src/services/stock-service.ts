import redis from './redis';
import prisma from './prisma';

const PAYMENT_CONFIRMED_STREAM = 'payment_confirmed';
const GROUP_NAME = 'stock_group';

async function setupConsumerGroup() {
  try {
    await redis.xgroup('CREATE', PAYMENT_CONFIRMED_STREAM, GROUP_NAME, '0', 'MKSTREAM');
    console.log(`Grupo de consumidores '${GROUP_NAME}' criado para o serviço de estoque.`);
  } catch (err: any) {
    if (err.message.includes('BUSYGROUP')) {
      console.log(`Grupo de consumidores '${GROUP_NAME}' já existe para o estoque.`);
    } else {
      console.error('Erro ao criar grupo de estoque:', err);
    }
  }
}

async function startProcessing() {
  console.log('Iniciando o serviço de estoque...');
  await setupConsumerGroup();

  while (true) {
    try {
      const messages = await redis.xreadgroup(
        'GROUP', GROUP_NAME, 'stock_processor', 'COUNT', 1, 'BLOCK', 1000, 'STREAMS', PAYMENT_CONFIRMED_STREAM, '>'
      ) as [string, [string, string[]][]][];

      if (messages) {
        for (const stream of messages) {
          const streamName = stream[0];
          const messageList = stream[1];

          for (const message of messageList) {
            const messageId = message[0];
            const data: { [key: string]: string } = {};
            const messageData = message[1];
            for (let i = 0; i < messageData.length; i += 2) {
              data[messageData[i]] = messageData[i + 1];
            }

            console.log(`Validando estoque para o pedido ${data.orderId}...`);

            const order = await prisma.order.findUnique({
              where: { id: data.orderId },
              include: { orderItems: { include: { product: true } } },
            });

            if (!order) {
              console.error(`Pedido ${data.orderId} não encontrado.`);
              await redis.xack(streamName, GROUP_NAME, messageId);
              continue;
            }


            await prisma.$transaction(async (tx) => {
              const stockPromises = order.orderItems.map(item => {
                return tx.product.updateMany({
                  where: {
                    id: item.productId,
                    stock: {
                      gte: item.quantity,
                    },
                  },
                  data: {
                    stock: {
                      decrement: item.quantity,
                    },
                  },
                });
              });

              const updatedProducts = await Promise.all(stockPromises);

              const allProductsUpdated = updatedProducts.every(result => result.count > 0);

              if (allProductsUpdated) {
                await tx.order.update({
                  where: { id: data.orderId },
                  data: { status: 'CONFIRMED' },
                });
                console.log(`Estoque atualizado e pedido ${data.orderId} confirmado.`);
              } else {
                await tx.order.update({
                  where: { id: data.orderId },
                  data: { status: 'CANCELLED' },
                });
                console.log(`Estoque insuficiente. Pedido ${data.orderId} cancelado.`);
              }
            });


            await redis.xack(streamName, GROUP_NAME, messageId);
          }
        }
      }
    } catch (error) {
      console.error('Erro no processamento de estoque:', error);
    }
  }
}

startProcessing();
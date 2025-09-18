import redis from './redis';
import prisma from './prisma';

const PAYMENT_STREAM = 'payment_requests';
const PAYMENT_CONFIRMED_STREAM = 'payment_confirmed';
const PAYMENT_FAILED_STREAM = 'payment_failed';

const GROUP_NAME = 'payment_group';

async function setupConsumerGroup() {
  try {

    await redis.xgroup('CREATE', PAYMENT_STREAM, GROUP_NAME, '0', 'MKSTREAM');
    console.log(`Grupo de consumidores '${GROUP_NAME}' criado com sucesso.`);
  } catch (err: any) {

    if (err.message.includes('BUSYGROUP')) {
      console.log(`Grupo de consumidores '${GROUP_NAME}' já existe.`);
    } else {
      console.error('Erro ao criar o grupo de consumidores:', err);
    }
  }
}

async function startProcessing() {
  console.log('Iniciando o serviço de pagamento...');
  await setupConsumerGroup();

  while (true) {
    try {
      const messages = await redis.xreadgroup(
        'GROUP', GROUP_NAME, 'payment_processor', 'COUNT', 1, 'BLOCK', 1000, 'STREAMS', PAYMENT_STREAM, '>'
      ) as [string, [string, string[]][]][];

      if (messages) {
        for (const stream of messages) {
          const streamName = stream[0];
          const messageList = stream[1];

          for (const message of messageList) {
            const messageId = message[0];
            const messageData = message[1];
            const data: { [key: string]: string } = {};

            for (let i = 0; i < messageData.length; i += 2) {
              data[messageData[i]] = messageData[i + 1];
            }

            console.log(`Processando pagamento para o pedido ${data.orderId}...`);
            // Simula o processamento do pagamento
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simula um atraso de 2 segundos
            const isPaymentSuccessful = Math.random() > 0.1;
            
            if (isPaymentSuccessful) {
              console.log(`Pagamento do pedido ${data.orderId} confirmado.`);
              await redis.xadd(PAYMENT_CONFIRMED_STREAM, '*', 'orderId', data.orderId);
            } else {
              console.log(`Pagamento do pedido ${data.orderId} falhou.`);
              await redis.xadd(PAYMENT_FAILED_STREAM, '*', 'orderId', data.orderId);
            }

            await redis.xack(streamName, GROUP_NAME, messageId);
          }
        }
      }
    } catch (error) {
      console.error('Erro no processamento do stream:', error);
    }
  }
}

startProcessing();
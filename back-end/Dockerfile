# back-end/Dockerfile

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
# Copia o schema do Prisma antes de rodar o 'npm install'
COPY prisma ./prisma/

# Instala TODAS as dependências. Agora, o 'postinstall' encontrará o schema.
RUN npm install

# O comando para iniciar a aplicação em modo de desenvolvimento
CMD ["npm", "run", "dev"]
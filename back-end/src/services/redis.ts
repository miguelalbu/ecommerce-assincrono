import Redis from 'ioredis';

// Configura a conexão com o Redis
const redis = new Redis({
  host: 'localhost', 
  port: 6379,
});

// Trata erros de conexão
redis.on('error', (err) => {
  console.error('Erro de conexão com o Redis:', err);
});

export default redis;
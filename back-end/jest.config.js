module.exports = {
  // O ambiente onde os testes serão executados (Node.js)
  testEnvironment: 'node',
  
  // Informa ao Jest para usar o ts-jest para transpilar arquivos TypeScript
  preset: 'ts-jest',
  
  // Arquivo que será executado antes de cada suíte de testes (para mocar o Prisma)
  setupFilesAfterEnv: ['<rootDir>/__tests__/singleton.ts'],
  
  // Padrão para encontrar os arquivos de teste
  testMatch: [
    '**/__tests__/**/*.test.ts'
  ],
};
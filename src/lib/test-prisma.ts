import { prisma } from './prisma';

async function testConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Database connection successful:', result);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

let prismaInstance = null;

try {
  prismaInstance = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });
} catch (err) {
  logger.warn('PrismaClient could not be initialized directly, initializing lazy fallback');
}

export const prisma = prismaInstance;
export default prisma;


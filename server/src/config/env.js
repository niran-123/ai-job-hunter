import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '../.env' });
dotenv.config(); // fallback to current working directory

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('postgresql://jobhunter:hunterpass@localhost:5432/jobhunter_db?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().default('development-jwt-secret-key-min-32-chars-long!'),
  ENCRYPTION_KEY: z.string().default('12345678901234567890123456789012'),
  OPENAI_API_KEY: z.string().optional().default(''),
  GEMINI_API_KEY: z.string().optional().default(''),
  DEFAULT_AI_PROVIDER: z.enum(['openai', 'gemini']).default('gemini'),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_REDIRECT_URI: z.string().default('http://localhost:5000/api/v1/notifications/gmail/callback'),
  GMAIL_SENDER_EMAIL: z.string().optional().default(''),
  DEFAULT_TIMEZONE: z.string().default('Asia/Kolkata'),
  DAILY_DIGEST_TIME: z.string().default('08:00'),
  MAX_JOB_AGE_DAYS: z.coerce.number().default(30),
  MAX_EXPERIENCE_YEARS: z.coerce.number().default(2),
  LOG_LEVEL: z.string().default('info')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn('⚠️ Environment validation warnings (some defaults used):', parsed.error.format());
}

export const env = parsed.success ? parsed.data : envSchema.parse({});


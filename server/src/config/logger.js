import { env } from './env.js';

let pinoLogger = null;

try {
  const pinoModule = await import('pino');
  const pino = pinoModule.default || pinoModule;
  pinoLogger = pino({
    level: env.LOG_LEVEL || 'info',
    base: { service: 'ai-global-job-hunter-api' },
    timestamp: pino.stdTimeFunctions ? pino.stdTimeFunctions.isoTime : () => `,"time":"${new Date().toISOString()}"`
  });
} catch {
  // Built-in fallback logger
  const format = (lvl, msg, extra) => {
    const ts = new Date().toISOString();
    return `[${ts}] [${lvl.toUpperCase()}] ${typeof msg === 'string' ? msg : JSON.stringify(msg)} ${extra ? JSON.stringify(extra) : ''}`;
  };

  pinoLogger = {
    info: (obj, msg) => console.log(format('info', msg || obj, msg ? obj : undefined)),
    warn: (obj, msg) => console.warn(format('warn', msg || obj, msg ? obj : undefined)),
    error: (obj, msg) => console.error(format('error', msg || obj, msg ? obj : undefined)),
    debug: (obj, msg) => console.debug(format('debug', msg || obj, msg ? obj : undefined))
  };
}

export const logger = pinoLogger;
export default logger;

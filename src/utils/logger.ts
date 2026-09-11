type Level = 'debug' | 'info' | 'warn' | 'error';
const levels: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const current = (process.env.LOG_LEVEL as Level) || 'info';

function log(level: Level, msg: string, ...args: unknown[]) {
  if (levels[level] >= levels[current]) {
    console[level === 'debug' ? 'log' : level](`[${level.toUpperCase()}] ${msg}`, ...args);
  }
}

export const logger = {
  debug: (m: string, ...a: unknown[]) => log('debug', m, ...a),
  info: (m: string, ...a: unknown[]) => log('info', m, ...a),
  warn: (m: string, ...a: unknown[]) => log('warn', m, ...a),
  error: (m: string, ...a: unknown[]) => log('error', m, ...a),
};
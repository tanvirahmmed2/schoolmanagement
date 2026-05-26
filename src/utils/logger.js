const IS_PROD = process.env.NODE_ENV === "production";
const IS_DEV  = !IS_PROD;

function timestamp() {
  return new Date().toISOString();
}

function format(level, message, meta) {
  if (IS_PROD) {
    // Structured JSON in production
    return JSON.stringify({ ts: timestamp(), level, message, ...meta });
  }
  // Human-readable in dev
  const metaStr = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp()}] ${level.toUpperCase()} ${message}${metaStr}`;
}

export const logger = {
  info(message, meta = {}) {
    console.log(format("info", message, meta));
  },
  warn(message, meta = {}) {
    console.warn(format("warn", message, meta));
  },
  error(message, meta = {}) {
    console.error(format("error", message, meta));
  },
  debug(message, meta = {}) {
    if (IS_DEV) console.debug(format("debug", message, meta));
  },
  /** Log API request */
  request(method, path, status, durationMs) {
    this.info(`${method} ${path} ${status}`, { ms: durationMs });
  },
};

export default logger;

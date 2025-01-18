const logger = {
  info: (message, ...args) => {
    console.log(`[INFO] ${message}`, ...args);
  },

  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
  },

  warn: (message, ...args) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};

module.exports = logger;

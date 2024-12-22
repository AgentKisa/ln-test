const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;

// format log
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = createLogger({
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "out.log" }),
  ],
});

module.exports = logger;

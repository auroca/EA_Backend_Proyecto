import pino from 'pino';

const logger = pino(
    process.env.NODE_ENV === 'production'
        ? {
              level: process.env.LOG_LEVEL || 'info'
          }
        : {
              level: process.env.LOG_LEVEL || 'debug',
              transport: {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                      translateTime: 'SYS:standard',
                      ignore: 'pid,hostname'
                  }
              }
          }
);

export default class Logging {
    public static log = (message: string, data?: unknown) => this.info(message, data);

    public static info = (message: string, data?: unknown) => {
        if (data === undefined) {
            logger.info(message);
        } else {
            logger.info(data, message);
        }
    };

    public static warning = (message: string, data?: unknown) => {
        if (data === undefined) {
            logger.warn(message);
        } else {
            logger.warn(data, message);
        }
    };

    public static error = (message: string, data?: unknown) => {
        if (data === undefined) {
            logger.error(message);
        } else {
            logger.error(data, message);
        }
    };
}

require('dotenv').config()

const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: './var/log/error.log', level: 'error' }),
        new winston.transports.File({ filename: './var/log/info.log', level: 'info' }),
        new winston.transports.File({ filename: './var/log/combined.log' }),
    ],
});

const asyncRedis = require("async-redis")
const redis = asyncRedis.createClient()
redis.on("error", function (err) {
    logger.info("Error " + err);
});

module.exports = {
    logger,
    redis,
}
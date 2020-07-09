const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: {service: 'user-service'},
  transports: [
    new winston.transports.File({filename: './var/log/error.log', level: 'error'}),
    new winston.transports.File({filename: './var/log/combined.log'}),
  ],
});


const axios = require('axios')
const rateLimit = require('axios-rate-limit')

const http = rateLimit(axios.create({
  auth: {
    username: process.env.MOYSKLAD_LOGIN,
    password: process.env.MOYSKLAD_PASSWORD,
  }
}), {maxRequests: 100, perMilliseconds: 5000, maxRPS: 5})

const asyncRedis = require("async-redis")
const redis = asyncRedis.createClient()
redis.on("error", function (err) {
  logger.info("Error " + err);
});

module.exports = {
  logger,redis,http
}
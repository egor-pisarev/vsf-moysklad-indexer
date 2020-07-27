module.exports = (config) => {
    const axios = require('axios')
    const rateLimit = require('axios-rate-limit')

    const http = rateLimit(axios.create({
        auth: {
            username: process.env.MOYSKLAD_LOGIN,
            password: process.env.MOYSKLAD_PASSWORD,
        }
    }), { maxRequests: 100, perMilliseconds: 5000, maxRPS: 5 })

    return {
        client: http
    }
  

}
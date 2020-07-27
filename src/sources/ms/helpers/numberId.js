const { redis } = require('../../../utils')

module.exports = {
    numberId: async(strId) => {

        let numberId = await redis.get(`id:${strId}`)

        if (numberId) {
            return parseInt(numberId)
        }

        let lastId = await redis.get('id:last')

        if (!lastId) {
            lastId = 0
        }
        lastId++
        await redis.set('id:last', lastId)
        await redis.set(`id:${strId}`, lastId)
        return parseInt(lastId)
    }
}
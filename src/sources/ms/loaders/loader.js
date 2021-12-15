const { redis, logger } = require('../../../utils')
const fs = require('fs')

module.exports = (config) => {

    const { client } = require('../client')(config)

    const load = async (href, key) => {

        let value = null
        if (process.env.USE_CACHE === true) {
            value = await redis.get(`${key}`)
        }

        if (!value) {
            logger.info(`Load from API ${href}`)
            let { data } = await client.get(href)
            if (process.env.USE_CACHE === true) {
                await redis.set(`${key}`, JSON.stringify(data))
            }
            return data
        }
       // fs.writeFile(`${__dirname}/../../../../var/log/${key}.json`, value, () => console.log(`${key} wrote`))
        return JSON.parse(value)
    }

    const loader = async (href, identity, parseRow) => {

        let page = 0

        const parse = async (href) => {

            logger.info(`Load ${identity}: ${href}, ${page}`)

            try {

                const data = await load(href, `${identity}-${page}`)

                for (let i = 0; i < data.rows.length; i++) {
                    await parseRow(data.rows[i])
                }

                if (data.meta.nextHref) {
                    page++
                    return parse(data.meta.nextHref)
                }

            } catch (e) {
                console.log('Loading from API error')
                console.log(e)
            }


        }

        return parse(href)

    }

    return {
        loader,
        client
    }

}

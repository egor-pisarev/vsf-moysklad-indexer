
const {redis, http, logger} = require('./utils')

const load = async (href, key) => {
  let value = await redis.get(`${key}`)
  if (!value) {
    logger.info(`Load from API ${href}`)
    let {data} = await http.get(href)
    await redis.set(`${key}`, JSON.stringify(data))
    return data
  }
  return JSON.parse(value)
}

const loader = async (href, identity, parseRow) => {

  let page = 0

  const parse = async (href) => {

    logger.info(`Load ${identity}: ${href}, ${page}`)

    const data = await load(href, `${identity}-${page}`)

    for (let i = 0; i < data.rows.length; i++) {
      await parseRow(data.rows[i])
    }

    if (data.meta.nextHref) {
      page++
      return parse(data.meta.nextHref)
    }

  }

  return parse(href)

}


module.exports = loader
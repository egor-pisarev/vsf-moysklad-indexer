const config = require('../config.json')
const utils = require('./utils')

const elasticSearch = require('./targets/elasticSearch')(config, utils)
const cartcl = require('./targets/cartcl')(config, utils)
const file = require('./targets/file')(config, utils)

const parser = require('./sources/ms/parser')(config, utils)

const run = async () => {

    const isRunKey = 'indexer:isRun'

    let isRun = await utils.redis.get(isRunKey)

    if(isRun === '1') {
        console.log('Already run')
        return;
    }

    await utils.redis.set(isRunKey, '1')

    const entities = await parser()

    const result = await Promise.all([
        elasticSearch.run(entities),
        cartcl.run(entities),
        file.run(entities)
    ])

    await utils.redis.set(isRunKey, '0')

    return result
}

const purge = async () => {
    return Promise.all([
        elasticSearch.purge(),
        cartcl.purge(),
        file.purge()
    ])
}

module.exports = {
    run,
    purge
}
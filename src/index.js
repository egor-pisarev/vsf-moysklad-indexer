const config = require('../config.json')
const utils = require('./utils')

const elasticSearch = require('./targets/elasticSearch')(config, utils)
const cartcl = require('./targets/cartcl')(config, utils)
const parser = require('./sources/ms/parser')(config, utils)

const run = async () => {
    const entities = await parser()

    return Promise.all([
        elasticSearch.run(entities),
        cartcl.run(entities)
    ])
}

const purge = async () => {
    return Promise.all([
        elasticSearch.purge(),
        cartcl.purge()
    ])
}

module.exports = {
    run,
    purge
}
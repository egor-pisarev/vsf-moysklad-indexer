const config = require('../config.json')
const utils = require('./utils')

const elasticSearch = require('./targets/elasticSearch')(config, utils)


elasticSearch.purge().then(r => console.log(r))
const config = require('./config.json')
const utils = require('./src/utils/')

const msParser = require('./src/sources/ms/parser')(config, utils)
const wpParser = require('./src/sources/wp/parser')(config, utils)

let entities = {}

Promise.all([
  msParser(),
  wpParser(),
]).then(r => {
  r.map(entitiesItem => {
    entities = { ...entities, ...entitiesItem }
  })

  console.log(entities['cmsPages'])

})


return;
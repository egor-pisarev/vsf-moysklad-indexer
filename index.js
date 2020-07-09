// require('./src').indexer()

const Ms = require('./src/ms')
const ms = new Ms({config: {pageSize: 25}})

ms.test().then(r => {})
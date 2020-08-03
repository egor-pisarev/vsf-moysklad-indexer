// require('./src').purge().then(r => require('./src').run()).then(r => console.log(r))
require('./src').run().then(r => {
    console.log('Ready')
    process.exit(0)
})
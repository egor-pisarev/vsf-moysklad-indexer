// require('./src').purge().then(r => require('./src').run()).then(r => console.log(r))
require('./src').run().then(r => {
    console.log('Ready')
    process.exit(0)
})

// require('dotenv').config()

// const {logger} = require('./src/utils')

// const config = require('./config.json')
// const { loader, client } = require('./src/sources/ms/loaders/loader')(config)

// const clearCustomers = async () => {

//     let customers = []

//     await loader(`https://online.moysklad.ru/api/remap/1.2/entity/customerorder?offset=0&limit=100`, 'customerorders', (row) => {
//         customers.push(row.agent.meta.href)
//     })

//     await loader(`https://online.moysklad.ru/api/remap/1.2/entity/counterparty?offset=0&limit=100`, 'customers', async (row) => {
//         if (row.email === 'asmolka@mail.ru') {
//             if (customers.indexOf(row.meta.href) < 0) {
//                 await client.delete(row.meta.href).catch(err => console.log(err.message))
//                 logger.info(`DELETED ${row.id}`)
//             }
//         }
//     })

// }

// clearCustomers().then(r => process.exit(0))
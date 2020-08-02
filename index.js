// require('./src').purge().then(r => require('./src').run()).then(r => console.log(r))
// require('./src').indexer().then(r => console.log('Ready'))

require('dotenv').config()

const {logger} = require('./src/utils')

const config = require('./config.json')
const { loader, client } = require('./src/sources/ms/loaders/loader')(config)

const clearCustomers = async () => {

    console.log('Start indexer')

    let customers = []
    let emails = []

    await loader(`https://online.moysklad.ru/api/remap/1.2/entity/customerorder?offset=0&limit=100`, 'customerorders', (row) => {
        console.log('Push customer ',row.agent.meta.href)
        customers.push(row.agent.meta.href)
    })

    let part = []
    let counter = 1

    await loader(`https://online.moysklad.ru/api/remap/1.2/entity/counterparty?offset=0&limit=500`, 'customers', async (row) => {
        if(counter % 1000 === 0){
            console.log('Deleted', counter)
        }
        if(row.email && emails.indexOf(row.email) >= 0){
            if (customers.indexOf(row.meta.href) < 0) {
                counter++
                part.push(client.delete(row.meta.href).catch(err => console.log(err.message)))
            }
        } else {
            //logger.warn(JSON.stringify(row))
            emails.push(row.email)
        }
        if(part.length === 10){
            await Promise.all(part)
            part = []
        }
    })

}

clearCustomers().then(r => process.exit(0))
require('dotenv').config()

const {logger} = require('./src/utils')

const config = require('./config.json')
const { loader, client } = require('./src/sources/ms/loaders/loader')(config)

const clearCustomers = async () => {

    let startTime = new Date().getTime()

    console.log('Start indexer', new Date())

    let customers = []
    let emails = []
    let counter = 0

    await loader(`https://online.moysklad.ru/api/remap/1.2/entity/customerorder?offset=0&limit=100`, 'customerorders', (row) => {
        customers.push(row.agent.meta.href)
    })

    let list = []
    let part = []
    let startPartTime = new Date().getTime()

    await loader(`https://online.moysklad.ru/api/remap/1.2/entity/counterparty?offset=0&limit=1000&order=updated,asc`, 'customers', async (row) => {
        if(row.email && emails.indexOf(row.email) >= 0){
            if (customers.indexOf(row.meta.href) < 0) {
                list.push({meta: row.meta})
            }
        } else {
            emails.push(row.email)
        }

        if(list.length === 200){
            part.push(client.post(`https://online.moysklad.ru/api/remap/1.2/entity/counterparty/delete`, list)
            .then(r=>console.log('Deleted 200.', `${(new Date().getTime() - startPartTime)/1000} sec`))
            .catch(err => console.log('Delete  error',err.message)))
            list = []
        }

        if(part.length === 10){
            startPartTime = new Date().getTime()
            console.log('Start DELETE part ')
            await Promise.all(part).then(r=>console.log('Deleted Part Total Script time', `${(new Date().getTime() - startTime)/1000} sec`)).catch(err=>console.log('Delete Part error',err.message))
            part = []
            counter+=2000
            console.log('Total deleted ',counter)
        }
    })



}

clearCustomers().then(r => process.exit(0))
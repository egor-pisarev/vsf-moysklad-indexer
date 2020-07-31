
const customersLoader = (config, utils) => {

    const { loader } = require('./loader')(config)

    return async () => {

        let customers = {}

        await loader('https://online.moysklad.ru/api/remap/1.2/entity/counterparty?offset=0&limit=100', 'customers', (row) => {
            if(row.email){
                customers[row.email] = {...row, providerId: row.id}
            }
        })

        return { customers }
    }

}

module.exports = customersLoader
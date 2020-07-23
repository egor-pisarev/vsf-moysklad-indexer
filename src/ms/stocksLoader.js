const loader = require('./loader')
const { logger } = require('./utils')

const stocksLoader = async() => {

    let stocks = {}

    await loader('https://online.moysklad.ru/api/remap/1.2/report/stock/all?offset=0&limit=100', 'stocks', (row) => {
        stocks[row.code] = {
            stock: row.stock
        }
    })

    return { stocks }

}

module.exports = stocksLoader

const stocksLoader = (config, utils) => {

    const { loader } = require('./loader')(config)

    return async () => {

        let stocks = {}
        
        await loader('https://online.moysklad.ru/api/remap/1.2/report/stock/all?offset=0&limit=100', 'stocks', (row) => {
            let matches = row.meta.href.match(/https\:\/\/online\.moysklad\.ru\/api\/remap\/1\.2\/entity\/(product|variant)\/(.*)\?/)
            if (matches) {
                stocks[matches[2]] = {
                    stock: row.stock
                }
            } else {
                stocks[row.meta.href] = {
                    stock: row.stock
                }
            }
        })
        return { stocks }
    }

}

module.exports = stocksLoader
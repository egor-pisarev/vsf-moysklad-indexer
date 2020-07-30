module.exports = (config, utils) => {
    const categoriesLoader = require('./categoriesLoader')(config, utils)
    const variantsLoader = require('./variantsLoader')(config, utils)
    const stocksLoader = require('./stocksLoader')(config, utils)
    const customersLoader = require('./customersLoader')(config, utils)

    return {
        categoriesLoader,
        variantsLoader,
        stocksLoader,
        customersLoader
    }
}
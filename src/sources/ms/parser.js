const fs = require('fs')

module.exports = (config, utils) => {
  const { categoriesLoader, variantsLoader, stocksLoader, customersLoader } = require('./loaders')(config, utils)

  return async () => {

    const { categories, indexedRows } = await categoriesLoader()
    const { stocks } = await stocksLoader()
    const { products, attributes } = await variantsLoader({ indexedRows, categories, stocks })
    const { customers } = await customersLoader()

    //fs.writeFile(`${__dirname}/../../../var/results/products.json`, JSON.stringify(products), () => console.log('Products results wrote'))

    return { category: categories, product: products, attribute: attributes, customer: customers }
  }

}
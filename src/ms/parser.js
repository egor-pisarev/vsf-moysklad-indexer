const fs = require('fs')

const categoriesLoader = require('./categoriesLoader')
const variantsLoader = require('./variantsLoader')
const stocksLoader = require('./stocksLoader')

module.exports = async () => {

  const {categories, indexedRows} = await categoriesLoader()
  const {stocks} = await stocksLoader()
  const {products, attributes} = await variantsLoader({indexedRows, categories, stocks})

  fs.writeFile(`./var/log/PARSED_CATEGORIES.json`, JSON.stringify(categories), () => {})
  fs.writeFile(`./var/log/PARSED_PRODUCTS.json`, JSON.stringify(products), () => {})
  fs.writeFile(`./var/log/PARSED_ATTRIBUTES.json`, JSON.stringify(attributes), () => {})

}
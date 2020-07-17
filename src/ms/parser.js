const fs = require('fs')

const categoriesLoader = require('./categoriesLoader')
const variantsLoader = require('./variantsLoader')
const stocksLoader = require('./stocksLoader')

module.exports = async () => {

  const {categories, indexedRows} = await categoriesLoader()
  const {stocks} = await stocksLoader()
  const {products, attributes} = await variantsLoader({indexedRows, categories, stocks})

  return {category: categories, product: products, attribute: attributes}

}
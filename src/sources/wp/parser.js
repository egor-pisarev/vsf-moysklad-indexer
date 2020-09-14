const fs = require('fs')
const slugify = require('@sindresorhus/slugify');

module.exports = (config, utils) => {
  // const { categoriesLoader, variantsLoader, stocksLoader, customersLoader } = require('./loaders')(config, utils)
  const { client } = require('./client')(config)

  return async () => {

    let cms_page = []
    let { data } = await client.get(`${config.wordpress.url}/wp-json/wp/v2/posts`)

    for (let i = 0; i < data.length; i++) {
      cms_page.push({
        page_id: data[i].id,
        title: data[i].title.rendered,
        identifier: slugify(data[i].title.rendered),
        content: data[i].content.rendered,
        content_heading: data[i].title.rendered,
        meta_description: data[i].excerpt.rendered,
        meta_keywords: '',
        store_id: 1
      })
    }
    //fs.writeFile(`${__dirname}/../../../var/results/products.json`, JSON.stringify(products), () => console.log('Products results wrote'))

    return { cms_page }
  }

}
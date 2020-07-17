const loader = require('./loader')
const slugify = require('@sindresorhus/slugify');
const {logger} = require('./utils')
const fs = require('fs')

const categoriesLoader = async () => {

  let categories = {}
  let indexedRows = {}

  const root = {
    id: 1,
    slug: 'shop',
    name: 'Магазин'
  }

  const parseCategory = (row) => {

    let slug = slugify(row.name)

    let category = {
      id: row.id,
      parent_id: root.id,
      name: row.name,
      url_key: slug,
      path: `${root.id}/${row.id}`,
      pathName: row.pathName ? `${root.name}/${row.pathName}/${row.name}` : `${root.name}/${row.name}`,
      url_path: `${root.slug}/${slug}`,
      level: 2,
      position: 1,
      is_active: true,
      children_data: [],
      product_count: 0
    }

    if (row.pathName) {

      const parent = indexedRows[row.pathName]

      if (parent) {
        let ids = []
        let slugs = []

        if (parent.pathName.length > 0) {

          let paths = parent.pathName.split('/')

          for (let i = paths.length + 1; i--; i >= 1) {
            let path = paths.slice(0, i).join('/')
            let parent = indexedRows[path]
            if (!parent) {
              logger.error(`Parent not found by ${path}`)
              continue
            }
            ids.push(parent.id)
            slugs.push(parent.slug)
          }

        }

        ids.push(parent.id)
        slugs.push(parent.slug)

        category.parent_id = parent.id
        category.path = `${root.id}/${ids.join('/')}/${category.path}`
        category.url_path = `${root.slug}/${slugs.join('/')}/${category.url_path}`
        category.level = slugs.length + 2
        category.product_count = 0

      } else {
        logger.error(`Category not found by ${row.pathName}`)
      }

    }

    categories[row.id] = category

  }

  await loader('https://online.moysklad.ru/api/remap/1.2/entity/productfolder?offset=0&limit=100', 'categories', (row) => {
    let slug = slugify(row.name)
    indexedRows[row.pathName ? `${row.pathName}/${row.name}` : row.name] = {...row, slug}
  })

  for (let rowId in indexedRows) {
    parseCategory(indexedRows[rowId])
  }

  const findChildren = (parentId) => {

    let children = []
    let product_count = 0

    for (let id in categories) {
      if (categories[id].parent_id === parentId) {
        let data = findChildren(id)
        children.push(data.children_data)
        product_count += data.product_count
      }
    }

    if (categories[parentId]) {
      categories[parentId].children_data = children
      categories[parentId].product_count = product_count
    }

    return {
      children_data: {
        id: parentId,
        children_data: children
      },
      product_count
    }

  }

  let data = findChildren(root.id)

  categories[root.id] = {
    id: root.id,
    parent_id: null,
    name: root.name,
    url_key: root.slug,
    path: root.id,
    pathName: root.name,
    url_path: root.slug,
    level: 1,
    position: 1,
    is_active: true,
    children_data: data.children_data,
    product_count: data.product_count
  }

  fs.writeFile(`${__dirname}/../../var/log/PARSED_CATEGORIES.json`, JSON.stringify(categories), () => console.log('File wrote'))

  return {categories, indexedRows}

}

module.exports = categoriesLoader

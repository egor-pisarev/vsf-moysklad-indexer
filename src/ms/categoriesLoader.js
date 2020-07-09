const loader = require('./loader')
const slugify = require('@sindresorhus/slugify');
const {logger} = require('./utils')

const categoriesLoader = async () => {

  let categories = {}
  let indexedRows = {}

  const parseCategory = (row) => {

    let slug = slugify(row.name)

    let category = {
      id: row.id,
      parent_id: null,
      name: row.name,
      url_key: slug,
      path: row.id,
      pathName: row.pathName ? `${row.pathName}/${row.name}` : row.name,
      url_path: slug,
      level: 1,
      position: 1,
      is_active: true,
      children_data: []
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
        category.path = `${ids.join('/')}/${category.path}`
        category.url_path = `${slugs.join('/')}/${category.url_path}`
        category.level = slugs.length + 1

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

    for (let id in categories) {
      let current = categories[id]
      if (current.parent_id === parentId) {
        children.push(findChildren(current.id))
      }
    }

    if (categories[parentId]) {
      categories[parentId].children_data = children
    }

    return {
      id: parentId,
      children_data: children
    }

  }

  findChildren(null)

  return {categories, indexedRows}

}

module.exports = categoriesLoader

const loader = require('./loader')
const fs = require('fs')
const slugify = require('@sindresorhus/slugify');

const {logger} = require('./utils')

const ASSET_PATH = `${__dirname}/../../var/assets`

const variantsLoader = async ({indexedRows, categories, stocks}) => {

  let currentProductId = null
  const products = {}
  const attributes = {}

  const parseAttributes = (row) => {

    let variantAttributes = []

    if (row.characteristics) {
      row.characteristics.forEach(characteristic => {

        //Add if attribute not exists
        if (!attributes[characteristic.id]) {
          attributes[characteristic.id] = {
            id: characteristic.id,
            default_frontend_label: characteristic.name,
            default_value: '',
            attribute_code: characteristic.id,
            options: [],
            products: []
          }
        }
        //Add if option not exists
        if (!attributes[characteristic.id].options.find(attribute => attribute.value === characteristic.value)) {

          attributes[characteristic.id].options.push({
            label: characteristic.value,
            value: characteristic.value,
          })

        }
        //set attribute to variant
        variantAttributes.push({
          id: characteristic.id,
          label: characteristic.name,
          value: characteristic.value
        })
        //??
        // attributes[characteristic.id].products.push(row.product.id)

      })
    }

    return variantAttributes
  }

  const parseStock = (row) => {

    let qty = 0
    if (stocks[row.product.code]) {
      qty = stocks[row.product.code].stock
    }

    if (stocks[row.code]) {
      qty += stocks[row.code].stock
    }

    return [
      {
        is_in_stock: qty > 0,
        qty
      }
    ]
  }

  const parseGeneralData = async (row, images) => {
    let data = {
      id: row.id,
      name: row.name,
      sku: row.code,
      price: row.salePrices.value,
      type_id: 'configurable',
      status: 1
    }

    return {...data, ...parsePrices(row), ...await parseImages(images)}
  }

  const parsePrices = (row) => {
    const salePrice = row.salePrices.find(price => price.priceType.name === 'Цена продажи')
    const specialPrice = row.salePrices.find(price => price.priceType.name === 'Цена со скидкой')
    return {
      price: salePrice ? salePrice.value : 0,
      special_price: specialPrice ? specialPrice.value : 0
    }
  }

  const downloadImage = (image) => {

    let assetName = `${ASSET_PATH}/${image.filename}`

    return new Promise((resolve, reject) => {
      fs.access(assetName, fs.constants.F_OK, (err) => {
        if (err) {
          http(image.meta.downloadHref, {
            responseType: 'stream',
          }).then((response) => {
            logger.info(`Download image ${image.meta.downloadHref}`)
            response.data
              .pipe(fs.createWriteStream(assetName))
              .on('finish', () => resolve())
              .on('error', e => reject(e))
          })
        } else {
          resolve()
        }
      })
    })
  }

  const parseImages = async (images) => {
    let media_gallery = []
    let image = null
    if (images.meta.size > 0) {
      for (let i = 0; i < images.rows.length; i++) {
        let image = images.rows[i]
        await downloadImage(image)
        media_gallery.push({
          image: `/assets/${image.filename}`,
          pos: i,
          typ: 'image',
          lab: null,
          vid: null
        })
      }
      image = media_gallery[0].image
    }
    return {
      media_gallery,
      image
    }
  }

  const addNewProduct = async (row) => {
    let p = await parseGeneralData(row, row.product.images)
    p.configurable_children = []
    p.configurable_options = []
    p.type_id = 'configurable'
    p.category_ids = []
    p.category = []
    p.stock = parseStock(row)

    if (row.product.pathName.length > 0) {
      if (indexedRows[row.product.pathName]) {
        p.category_ids.push(indexedRows[row.product.pathName].id)
        if (categories[indexedRows[row.product.pathName].id]) {
          p.category.push({
            category_id: categories[indexedRows[row.product.pathName].id].id,
            name: categories[indexedRows[row.product.pathName].id].name,
            slug: categories[indexedRows[row.product.pathName].id].slug,
            path: categories[indexedRows[row.product.pathName].id].url_path,
          })
        } else {
          logger.error(`Category not found by ${row.product.pathName}`)
        }
      } else {
        logger.error(`IndexedRow not found by ${row.product.pathName}`)
      }
    }

    currentProductId = row.product.id
    return p
  }

  const parseVariant = async (row) => {

    let newProduct = currentProductId !== row.product.id

    if (newProduct) {
      products[row.product.id] = await addNewProduct(row)
    }

    let variant = await parseGeneralData(row, row.images)

    const variantAttributes = parseAttributes(row)

    variantAttributes.forEach(variantAttribute => {
      if (!products[row.product.id][`${variantAttribute.id}_options`]) {
        products[row.product.id][`${variantAttribute.id}_options`] = []
      }
      products[row.product.id][`${variantAttribute.id}_options`].push(variantAttribute.value)

      let attributeOption = products[row.product.id].configurable_options.find(option => option.attribute_code === variantAttribute.id)

      if (!attributeOption) {
        attributeOption = {
          id: variantAttribute.id,
          attribute_id: variantAttribute.id,
          label: variantAttribute.name,
          position: 1,
          values: []
        }
        products[row.product.id].configurable_options.push(attributeOption)
      }

      attributeOption.values.push({
        value_index: variantAttribute.value,
        label: variantAttribute.label,
      })

      variant[variantAttribute.id] = variantAttribute.value

    })

    products[row.product.id].configurable_children.push(variant)

  }

  await loader('https://online.moysklad.ru/api/remap/1.2/entity/variant?offse=0&limit=100&expand=product,images,product.images', 'variants', parseVariant)

  return {
    products,
    attributes
  }

}

module.exports = variantsLoader
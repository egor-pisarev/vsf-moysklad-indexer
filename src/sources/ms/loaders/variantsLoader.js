const fs = require('fs')
const slugify = require('@sindresorhus/slugify');

const ASSET_PATH = `${__dirname}/../../../../var/assets`
const { numberId } = require('../helpers/numberId')

module.exports = (config, utils) => {

    const { logger } = utils

    const {loader, client} = require('./loader')(config)

    const variantsLoader = async({ indexedRows, categories, stocks }) => {

        const products = {}
        const attributes = {}
    
        const parseAttributes = async(row) => {
    
            let variantAttributes = []
    
            if (row.characteristics) {
    
                for (let i = 0; i < row.characteristics.length; i++) {
                    let characteristic = row.characteristics[i]
    
                    characteristic.id = await numberId(characteristic.id)
    
                    let optionIndex = await numberId(`${characteristic.id}:${characteristic.value}`)
    
                    let attributeCode = slugify(characteristic.name)
    
                    //Add if attribute not exists
                    if (!attributes[characteristic.id]) {
                        attributes[characteristic.id] = {
                            id: characteristic.id,
                            default_frontend_label: characteristic.name,
                            label: characteristic.name,
                            default_value: '',
                            attribute_code: `${attributeCode}`,
                            frontend_input: "select",
                            frontend_label: characteristic.name,
                            is_user_defined: true,
                            is_unique: true,
                            attribute_id: characteristic.id,
                            is_visible: true,
                            is_comparable: true,
                            is_visible_on_front: true,
                            position: 1,
                            options: [],
                            products: []
                        }
                    }
                    //Add if option not exists
                    if (!attributes[characteristic.id].options.find(attribute => attribute.value === optionIndex)) {
    
                        attributes[characteristic.id].options.push({
                            label: characteristic.value,
                            value: optionIndex,
                        })
    
                    }
                    //set attribute to variant
                    variantAttributes.push({
                            id: characteristic.id,
                            label: characteristic.value,
                            value: optionIndex,
                            name: characteristic.name
                        })
                        //??
                        // attributes[characteristic.id].products.push(row.product.id)
                }
            }
    
            return variantAttributes
        }
    
        const parseStock = (row) => {
    
            // if (stocks[row.code]) {
            //     products[row.product.id].qty += stocks[row.code].stock
            // }

            let qty = 0
    
            if (stocks[row.code] && stocks[row.code].stock > 0) {
                products[row.product.id].stock.is_in_stock = true
                qty = stocks[row.code].stock
            }
    
            addProductsCountToCategory(row, stocks[row.code] ? stocks[row.code].stock : 0)
            return qty
        }

       
        const nowDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    
        const parseGeneralData = async(row, images) => {

            let udated = row.updated?row.updated.substring(0,19):nowDate

            let data = {
                providerId: row.providerId,
                id: row.id,
                name: row.name,
                sku: row.sku,
                price: row.salePrices.value,
                type_id: 'configurable',
                status: 1,
                minimum: 1,
                url_path: slugify(row.name),
                created_at: udated,
                updated_at: udated,
                length: 0,
                width: 0,
                height: 0,
                weight: 0,
                weight_class: "кг",
                length_class: "см",
                tier_prices: []
            }
    
            return {...data, ...parsePrices(row), ...await parseImages(images) }
        }
    
        const formatPrice = (price) => Math.round(price / 100)
    
        const parsePrices = (row) => {
    
            let salePrice = row.salePrices.find(price => price.priceType.name === 'Цена продажи')
            let specialPrice = row.salePrices.find(price => price.priceType.name === 'Цена со скидкой')
    
            salePrice = salePrice ? formatPrice(salePrice.value) : 0
            specialPrice = specialPrice ? formatPrice(specialPrice.value) : 0
    
            return {
                price: salePrice,
                special_price: specialPrice,
                final_price: specialPrice ? specialPrice : salePrice,
                priceInclTax: specialPrice ? specialPrice : salePrice,
                price_incl_tax: specialPrice ? specialPrice : salePrice,
                priceTax: 0,
                originalPrice: salePrice,
                originalPriceInclTax: salePrice,
                specialPriceInclTax: specialPrice,
                specialPriceTax: 0,
                regular_price: salePrice,
                marketPrice: 0,
            }
        }
    
        const downloadImage = (image) => {
    
            let assetName = `${ASSET_PATH}/${image.filename}`
    
            return new Promise((resolve, reject) => {
                fs.access(assetName, fs.constants.F_OK, (err) => {
                    if (err) {
                        client(image.meta.downloadHref, {
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
    
        const parseImages = async(images) => {
            let media_gallery = []
            let image = null
            if (images.meta.size > 0) {
                for (let i = 0; i < images.rows.length; i++) {
                    let image = images.rows[i]
                    await downloadImage(image)
                    media_gallery.push({
                        image: `/${image.filename}`,
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
                image,
                thumbnail: image
            }
        }
    
        const setInitialStock = (row) => {
            if (stocks[row.product.code]) {
                products[row.product.id].stock.qty = stocks[row.product.code].stock
            }
        }
    
        const addNewProduct = async(row) => {
            let product = await parseGeneralData(row, row.product.images)

            let updated = new Date(row.updated.substring(0,9))
            let now = new Date()

            product.new = 0
            if(now.getTime() - updated.getTime() < 1000*3600*24*30){
                product.new = 1
            }
            
            product.providerId = row.providerProductId
            product.name = row.product.name
            product.description = row.product.description
            product.configurable_children = []
            product.configurable_options = []
            product.type_id = 'configurable'
            product.category_ids = []
            product.category = []
            product.visibility = 4
            product.qty = 0
            product.tax_class_id = 0
            product.stock = {
                is_in_stock: false
            }
    
            if (row.product.pathName.length > 0) {
                if (indexedRows[row.product.pathName]) {
                    product.category_ids.push(indexedRows[row.product.pathName].id)
                    if (categories[indexedRows[row.product.pathName].id]) {
                        product.category.push({
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
    
            return product
        }
    
        const addCountToCategory = (parentId, count, childrenId) => {
            if (categories[parentId].parent_id) {
                addCountToCategory(categories[parentId].parent_id, count, parentId)
            }
            categories[parentId].product_count += count
            if (childrenId) {
                categories[parentId].children_data.forEach(children => {
                    if (children.id === childrenId) {
                        children.product_count = count
                    } else if (children.product_count === undefined) {
                        children.product_count = 0
                    }
                })
            }
        }
    
        const addProductsCountToCategory = (row, count) => {
            if (count > 0) {
                products[row.product.id].category_ids.forEach(id => {
                    addCountToCategory(id, count)
                })
            }
        }
    
        const parseVariant = async(row) => {
    
            row.providerId = row.id
            row.providerProductId = row.product.id

            //set unique sku from variant id
            row.sku = row.id
    
            //set number id from string id
            row.product.id = await numberId(row.product.id)
    
            //variant id should be the same as product id
            row.id = await numberId(row.id)
    
            if (!products[row.product.id]) {
                products[row.product.id] = await addNewProduct(row)
                setInitialStock(row)
            }
    
            let qty = parseStock(row)
    
            let variant = await parseGeneralData(row, row.images)
            variant.qty = qty
            
            const variantAttributes = await parseAttributes(row)
    
            for (let i = 0; i < variantAttributes.length; i++) {
    
                let variantAttribute = variantAttributes[i]
                    // const attributeCode = `attribute_${variantAttribute.id}`
                let attributeCode = slugify(variantAttribute.name)
    
                if (!products[row.product.id][`${attributeCode}_options`]) {
                    products[row.product.id][`${attributeCode}_options`] = []
                }
                products[row.product.id][`${attributeCode}_options`].push(variantAttribute.value)
    
                let attributeOption = products[row.product.id].configurable_options.find(option => option.attribute_code === attributeCode)
    
                if (!attributeOption) {
                    attributeOption = {
                        product_id: row.id,
                        attribute_code: attributeCode,
                        id: variantAttribute.id,
                        attribute_id: variantAttribute.id,
                        label: variantAttribute.name,
                        position: 1,
                        values: []
                    }
                    products[row.product.id].configurable_options.push(attributeOption)
                }
    
                if (!attributeOption.values.find(i => i.value_index === variantAttribute.value)) {
                    attributeOption.values.push({
                        value_index: variantAttribute.value,
                        label: variantAttribute.label,
                    })
                }
    
                variant[attributeCode] = variantAttribute.value
                if (products[row.product.id][attributeCode] === undefined) {
                    products[row.product.id][attributeCode] = null
                }
            }
    
            products[row.product.id].configurable_children.push(variant)
    
        }
    
        await loader('https://online.moysklad.ru/api/remap/1.2/entity/variant?offse=0&limit=100&expand=product,images,product.images', 'variants', parseVariant)
    
        return {
            products,
            attributes,
            categories
        }
    
    }

    return variantsLoader
}
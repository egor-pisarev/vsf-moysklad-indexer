const fs = require('fs')
const slugify = require('@sindresorhus/slugify');

const ASSET_PATH = `${__dirname}/../../../../var/assets`
const { numberId } = require('../helpers/numberId')

module.exports = (config, utils) => {

    const { logger } = utils

    const { loader, client } = require('./loader')(config)

    const variantsLoader = async ({ indexedRows, categories, stocks }) => {

        const products = {}
        const attributes = {}

        //const attributeCodeGenerator = (characteristic) => `attribute_${characteristic.providerId}`
        //const attributeCodeGenerator = (characteristic) => `attr_${slugify(characteristic.name)}`
        const attributeCodeGenerator = (characteristic) => `attribute_${characteristic.id}`

        const parseAttributes = async (row) => {

            let variantAttributes = []

            if (row.characteristics) {

                for (let i = 0; i < row.characteristics.length; i++) {
                    let characteristic = row.characteristics[i]

                    characteristic.providerId = characteristic.id
                    characteristic.id = await numberId(characteristic.id)

                    let optionIndex = await numberId(`${characteristic.id}:${characteristic.value}`)

                    let attributeCode = attributeCodeGenerator(characteristic)

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
                        providerId: characteristic.providerId,
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

        const parseQty = (row, productRow) => {
            return stocks[row.providerId] && stocks[row.providerId].stock > 0 ? stocks[row.providerId].stock : 0
        }

        const parseStock = (row, productRow) => {

            // if (stocks[row.code]) {
            //     products[row.product.id].qty += stocks[row.code].stock
            // }

            let qty = 0

            if (stocks[row.providerId] && stocks[row.providerId].stock > 0) {
                products[productRow.id].stock.is_in_stock = true
                qty = stocks[row.providerId].stock
            }

            addProductsCountToCategory(row, productRow, stocks[row.providerId] ? stocks[row.providerId].stock : 0)
            return qty
        }


        const nowDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

        const parseGeneralData = async (row, images) => {

            let udated = row.updated ? row.updated.substring(0, 19) : nowDate

            let data = {
                providerId: row.providerId,
                id: row.id,
                name: row.name,
                sku: row.sku,
                price: row.salePrices.value,
                type_id: 'configurable',
                status: 1,
                minimum: 1,
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

            return { ...data, ...parsePrices(row), ...await parseImages(images) }
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

        const parseImages = async (images) => {
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

        const setInitialStock = (productRow) => {
            if (stocks[productRow.code]) {
                products[productRow.id].stock.qty = stocks[productRow.code].stock
            }
        }

        const generateProductDescription = (productRow) => {
            return `Купить товар "${productRow.name}" по низкой цене в интернет магазине ${config.shopName}.`
        }

        const newInterval = 1000 * 3600 * 24 * 30//one month

        const addNewProduct = async (row, productRow) => {
            let product = await parseGeneralData(row, productRow.images)

            let updated = new Date(row.updated.substring(0, 10))

            let now = new Date()

            product.new = 0
            if (now.getTime() - updated.getTime() < newInterval) {
                product.new = 1
            }

            product.providerId = row.providerProductId
            product.name = productRow.name
            product.description = productRow.description
            product.type_id = 'simple'
            product.meta_description = productRow.description && productRow.description.length > 0 ? productRow.description.substring(0, 140) : generateProductDescription(productRow)

            if (productRow.variantsAmount > 0) {
                product.configurable_children = []
                product.configurable_options = []
                product.type_id = 'configurable'
            }

            product.category_ids = []
            product.category = []
            product.url_path = []
            product.visibility = 4
            product.qty = 0
            product.tax_class_id = 0
            product.stock = {
                is_in_stock: false
            }

            if (productRow.pathName.length > 0) {
                if (indexedRows[productRow.pathName]) {
                    product.category_ids.push(indexedRows[productRow.pathName].id)
                    if (categories[indexedRows[productRow.pathName].id]) {
                        product.category.push({
                            category_id: categories[indexedRows[productRow.pathName].id].id,
                            name: categories[indexedRows[productRow.pathName].id].name,
                            slug: categories[indexedRows[productRow.pathName].id].slug,
                            path: categories[indexedRows[productRow.pathName].id].url_path,
                        })

                    } else {
                        logger.error(`Category not found by ${productRow.pathName}`)
                    }
                } else {
                    logger.error(`IndexedRow not found by ${productRow.pathName}`)
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

        const addProductsCountToCategory = (row, productRow, count) => {
            if (count > 0) {
                products[productRow.id].category_ids.forEach(id => {
                    addCountToCategory(id, count)
                })
            }
        }

        const fillIds = async (row, productRow) => {
            row.providerId = row.id
            row.providerProductId = productRow.id
            //set unique sku from variant id
            row.sku = row.id

            if (row.product) {
                //set number id from string id
                row.product.id = await numberId(productRow.id)
            }
            //variant id should be the same as product id
            row.id = await numberId(row.id)
        }

        const parseVariant = async (row) => {

            if (row.product.variantsAmount === 0) {
                return
            }

            await fillIds(row, row.product)

            // if (parseQty(row, row.product) === 0) {
            //     return;
            // }

            if (!products[row.product.id]) {
                products[row.product.id] = await addNewProduct(row, row.product)
                setInitialStock(row.product)
            }

            let qty = parseStock(row, row.product)

            // if (qty === 0) {
            //     return;
            // }

            let variant = await parseGeneralData(row, row.images)
            variant.qty = qty

            variant.is_in_stock = qty > 0 ? 1 : 0

            if(variant.is_in_stock === 0){
                return;
            }

            const variantAttributes = await parseAttributes(row)

            for (let i = 0; i < variantAttributes.length; i++) {

                let variantAttribute = variantAttributes[i]
                // const attributeCode = `attribute_${variantAttribute.id}`
                //let attributeCode = slugify(variantAttribute.name)

                let attributeCode = attributeCodeGenerator(variantAttribute)
                if (!products[row.product.id][`${attributeCode}_options`]) {
                    products[row.product.id][`${attributeCode}_options`] = []
                }

                if (products[row.product.id][`${attributeCode}_options`].indexOf(variantAttribute.value) < 0) {
                    products[row.product.id][`${attributeCode}_options`].push(variantAttribute.value)
                }

                if (!products[row.product.id].configurable_options) {
                    products[row.product.id].configurable_options = []
                    products[row.product.id].type_id = 'configurable'
                }

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

            if (!products[row.product.id].configurable_children) {
                products[row.product.id].configurable_children = []
            }

            if (variant.is_in_stock === 1) {
                products[row.product.id].configurable_children.push(variant)
            }

        }

        const parseProduct = async (row) => {

            if (row.variantsCount === 0) {

                await fillIds(row, row)

                // if (parseQty(row, row) === 0) {
                //     return;
                // }

                if (!products[row.id]) {
                    products[row.id] = await addNewProduct(row, row)
                    setInitialStock(row, row)
                }

                let qty = parseStock(row, row)

                products[row.id].qty = qty

                products[row.id].configurable_children = [
                    {
                        ...products[row.id],
                        is_in_stock: qty > 0?1:0,
                        image: null,
                    }
                ]
            }
        }

        await loader('https://online.moysklad.ru/api/remap/1.2/entity/variant?offse=0&limit=100&expand=product,images,product.images', 'variants', parseVariant)
        await loader('https://online.moysklad.ru/api/remap/1.2/entity/product?offse=0&limit=10&expand=images', 'products', parseProduct)

        return {
            products,
            attributes,
            categories
        }

    }

    return variantsLoader
}
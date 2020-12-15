async function categoryMapping(db, indexName, version) {
    const mapping = require('./category-mapping.json')

    await db.indices.putMapping({
        index: `${indexName}_category_${version}`,
        body: mapping
    }).then(res1 => {
        console.dir(res1, { depth: null, colors: true })
    }).catch(err => {
        console.error(err)
        return
    })
}

async function putMappings(db, indexName, version) {

    const mapping = require('./product-mapping.js')

    await db.indices.putMapping({
        index: `${indexName}_product_${version}`,
        body: {
            properties: mapping
        }
    }).then(res1 => {
        console.dir(res1, { depth: null, colors: true })
    }).catch(err => {
        console.error(err)
        return
    })

    await categoryMapping(db, indexName, version)

    await db.indices.putMapping({
        index: `${indexName}_attribute_${version}`,
        body: {
            properties: {
                id: { type: "integer" },
                attribute_id: { type: "integer" },
                options: {
                    properties: {
                        value: { type: "text" }
                    }
                }
            }
        }
    }).then(res3 => {
        console.dir(res3, { depth: null, colors: true })
    }).catch(err3 => {
        throw new Error(err3)
    })

    // await db.indices.putMapping({
    //     index: `${indexName}_taxrule_${version}`,
    //     body: {
    //         properties: {
    //             id: { type: "integer" },
    //             rates: {
    //                 properties: {
    //                     rate: { type: "float" }
    //                 }
    //             }
    //         }
    //     }
    // }).then(res2 => {
    //     console.dir(res2, { depth: null, colors: true })
    // }).catch(err2 => {
    //     throw new Error(err2)
    // })

    await db.indices.putMapping({
        index: `${indexName}_cms_page_${version}`,
        body: {
            properties: {
                page_id: { type: "integer" },
                identifier: { type: "keyword" }
            }
        }
    }).then(res2 => {
        console.dir(res2, { depth: null, colors: true })
    }).catch(err2 => {
        throw new Error(err2)
    })
}

module.exports = { putMappings }




  
function putAlias(db, originalName, aliasName, next) {
    let step2 = () => {
        db.indices.putAlias({ index: originalName, name: aliasName }).then(result => {
            console.log('Index alias created', result)
        }).then(next).catch(err => {
            console.log(err.message)
            next()
        })
    }
    return db.indices.deleteAlias({
        index: aliasName,
        name: originalName
    }).then((result) => {
        console.log('Public index alias deleted', result)
        step2()
    }).catch((err) => {
        console.log('Public index alias does not exists', err.message)
        step2()
    })
}

function deleteIndex(db, indexName, next) {
    db.indices.delete({
        "index": indexName
    }).then((res) => {
        console.dir(res, { depth: null, colors: true })
        next()
    }).catch(err => {
        console.error(err)
        next(err)
    })
}

function reIndex(db, fromIndexName, toIndexName, next) {
    db.reindex({
        waitForCompletion: true,
        body: {
            "source": {
                "index": fromIndexName
            },
            "dest": {
                "index": toIndexName
            }
        }
    }).then(res => {
        console.dir(res, { depth: null, colors: true })
        next()
    }).catch(err => {
        console.error(err)
        next(err)
    })
}

function createIndex(db, indexName, next) {

    const step2 = () => {

        db.indices.delete({
            "index": indexName
        }).then(res1 => {
            console.dir(res1, { depth: null, colors: true })
            db.indices.create({
                "index": indexName
            }).then(res2 => {
                console.dir(res2, { depth: null, colors: true })
                next()
            }).catch(err => {
                console.error(err)
                next(err)
            })
        }).catch(() => {
            db.indices.create({
                "index": indexName
            }).then(res2 => {
                console.dir(res2, { depth: null, colors: true })
                next()
            }).catch(err => {
                console.error(err)
                next(err)
            })
        })
    }

    return db.indices.deleteAlias({
        index: '*',
        name: indexName
    }).then((result) => {
        console.log('Public index alias deleted', result)
        step2()
    }).catch((err) => {
        console.log('Public index alias does not exists', err.message)
        step2()
    })
}

async function putMappings(db, indexName, next) {

    await db.indices.putMapping(require('./product-mapping.js')(indexName)).then(res1 => {
        console.dir(res1, { depth: null, colors: true })
    }).catch(err => {
        console.error(err)
        next(err)
        return
    })

    await db.indices.putMapping({
        index: indexName,
        type: "attribute",
        body: {
            properties: {
                id: { type: "integer" },
                attribute_id: { type: "integer" },

                options: {
                    properties: {
                        value: { type: "text", "index": "not_analyzed" }
                    }
                }
            }
        }
    }).then(res3 => {
        console.dir(res3, { depth: null, colors: true })
    }).catch(err3 => {
        throw new Error(err3)
    })

    await db.indices.putMapping({
        index: indexName,
        type: "taxrule",
        body: {
            properties: {
                id: { type: "integer" },
                rates: {
                    properties: {
                        rate: { type: "float" }
                    }
                }
            }
        }
    }).then(res2 => {
        console.dir(res2, { depth: null, colors: true })
    }).catch(err2 => {
        throw new Error(err2)
    })

    await db.indices.putMapping({
        index: indexName,
        type: "cms_page",
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

    // await db.indices.putMapping({
    //     index: indexName,
    //     type: "category",
    //     body: require('./category-mapping.json')
    // }).then(res2 => {
    //     console.dir(res2, {depth: null, colors: true})
    // }).catch(err2 => {
    //     throw new Error(err2)
    // })

    next()
}

module.exports = {
    putMappings,
    putAlias,
    createIndex,
    deleteIndex,
    reIndex
}
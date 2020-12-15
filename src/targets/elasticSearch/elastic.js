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

module.exports = {
    putAlias,
    createIndex,
    deleteIndex,
    reIndex
}

const path = require('path')
const fs = require('fs')
const jsonFile = require('jsonfile')

const { putMappings } = require('./putMappings')

let INDEX_VERSION = 1
let INDEX_META_DATA

const INDEX_META_PATH = path.join(__dirname, '../../../var/indexMetadata.json')

const entitiesTypes = ['product', 'attribute', 'category', 'cms_page']

module.exports = (config, utils) => {

  const { client } = require('./client')(config)

  function showWelcomeMsg() {
    console.log('** CURRENT INDEX VERSION', INDEX_VERSION, INDEX_META_DATA ? INDEX_META_DATA.updated : ``)
  }

  async function readIndexMeta() {
    return new Promise((resolve, reject) => {
      jsonFile.readFile(INDEX_META_PATH, (err, indexMeta) => {
        if (err) {
          console.log('Seems like first time run!', err.message)
          resolve({ version: 0, created: new Date(), updated: new Date() })
          return;
        }

        INDEX_META_DATA = indexMeta
        resolve(indexMeta)
      })

    })
  }

  async function updateMetaFile() {

    let indexMeta = await readIndexMeta()

    return new Promise((resolve, reject) => {
      indexMeta.version++
      INDEX_VERSION = indexMeta.version
      indexMeta.updated = new Date()
      jsonFile.writeFile(INDEX_META_PATH, indexMeta, (err) => {
        if (err) {
          console.error(err)
          reject(err)
        }
        resolve(indexMeta)
      })
    })
  }

  async function recreateTempIndex() {

    const { version, updated } = await updateMetaFile()

    for (let i = 0; i < entitiesTypes.length; i++) {

      const index = `${config.elasticsearch.indexName}_${entitiesTypes[i]}_${version}`

      const result = await client.indices.create({
        index
      })

      console.log('Index Created', result)
      console.log('** NEW INDEX VERSION', version, updated)

    }

    await putMappings(client, config.elasticsearch.indexName, version)
  }

  async function deleteOldIndex(indexName) {

    return client.indices.delete({
      index: indexName,
    }).then((result) => {

      console.log(`Index ${indexName} deleted`, result)

    }).catch((err) => {
      console.log(err)
      console.log('Index does not exst')
    })
  }

  async function publishTempIndex() {

    for (let i = 0; i < entitiesTypes.length; i++) {

      const type = entitiesTypes[i]
      const indexName = `${config.elasticsearch.indexName}_${type}`

      try {

        await client.indices.deleteAlias({
          index: `${indexName}_${INDEX_VERSION - 1}`,
          name: indexName
        })

        console.log('Public index alias deleted')

      } catch (err) {
        console.log('Public index alias does not exists', err.message)
      }

      await client.indices.putAlias({
        index: `${indexName}_${INDEX_VERSION}`,
        name: indexName
      })

      console.log('Index alias created')

      if (INDEX_VERSION > 1) {
        await deleteOldIndex(`${indexName}_${INDEX_VERSION - 1}`)
      }
    }

  }

  async function storeResult({ result, entityType }) {
    return client.index({
      index: `${config.elasticsearch.indexName}_${entityType}_${INDEX_VERSION}`,
      id: result.id,
      body: result
    }).catch(e => {
      console.log(result)
      console.log(e)
      throw e
    })
  }


  /**
   * Import full list of specific entites
   * @param {String} entityType
   * @param {Object} importer
   */
  async function importListOf({ entityType, entities }) {
    console.log('Import ', entityType)
    for (let i in entities) {
      await storeResult({ result: entities[i], entityType })
    }
  }

  const purge = async () => {
    return new Promise((resolve, reject) => {
      client.indices.delete({ index: '*' }).then(r => fs.unlink(INDEX_META_PATH, () => {
        console.log('Meta file removed')
        resolve()
      }))
    })
  }

  const run = async (entities) => {

    await readIndexMeta()
    showWelcomeMsg()
    await recreateTempIndex()

    console.log('Parse API')
    console.log('Import entities')

    for (let entityType in entities) {

      if (entitiesTypes.indexOf(entityType) < 0) continue
      fs.writeFile(`${__dirname}/../var/log/PARSET_${entityType}.json`, JSON.stringify(entities[entityType]), () => console.log(`Log added to ${entityType}`))
      await importListOf({ entityType, entities: entities[entityType] })

    }

    console.log('Publish items')

    await publishTempIndex()
  }

  return {
    run,
    purge
  }
}
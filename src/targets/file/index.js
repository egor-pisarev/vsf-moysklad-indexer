const fs = require('fs')

module.exports = (config, utils) => {

    const CONFIG_PATH = `${__dirname}/../../../${config.fileTarget.configPath}`
    const RESULTS_PATH = `${__dirname}/../../../${config.fileTarget.resultPath}`

    const configData = {
        "server": {
          "host": "BIND_HOST",
          "port": "BIND_PORT"
        },
        "products": {
          "defaultFilters": [
            "price",
            "stock.is_in_stock",
          ]
        }
      }

    const run = async (entities) => {

        configData.products.defaultFilters = Object.keys(entities.attribute).map(attr=>`attribute_${attr}`)
        configData.products.defaultFilters.push("price")
        configData.products.defaultFilters.push("stock.is_in_stock")

        fs.writeFile(CONFIG_PATH, JSON.stringify(configData), () => console.log(`Config file wrote to ${CONFIG_PATH}`))

        fs.writeFile(`${RESULTS_PATH}/attributes-ids.json`, JSON.stringify(Object.keys(entities.attribute)), () => console.log(`Attributes ids wrote`))
        fs.writeFile(`${RESULTS_PATH}/attributes-codes.json`, JSON.stringify(Object.keys(entities.attribute).map(attr=>`attr_${attr}`)), () => console.log(`Attributes ids wrote`))
    }

    return {
        run,
        purge: () => {

        }
    }

}
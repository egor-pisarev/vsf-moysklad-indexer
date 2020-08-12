const fs = require('fs')

module.exports = (config, utils) => {

    const CONFIG_PATH = `${__dirname}/../../../${config.fileTarget.configPath}`
    const RESULTS_PATH = `${__dirname}/../../../${config.fileTarget.resultPath}`

    // const configData = require(`${CONFIG_PATH}/local.json`)

    const run = async (entities) => {

        let i18n = ``

        Object.keys(entities.attribute).map(name => {
            i18n = `${i18n}
"${entities.attribute[name].attribute_code}_filter","${entities.attribute[name].label}"`
        })
        fs.writeFile(`${RESULTS_PATH}/i18n.json`, i18n, () => console.log(`i18n wrote`))

        //filterAggregationSize
        let filterAggregationSize = {}
        Object.keys(entities.attribute).map(name => {
            filterAggregationSize[`${entities.attribute[name].attribute_code}`] = entities.attribute[name].options.length
        })
        fs.writeFile(`${CONFIG_PATH}/filterAggregationSize.json`, JSON.stringify(filterAggregationSize), () => console.log(`filterAggregationSize wrote`))

        let defaultFilters = []
        defaultFilters.push("price")
        defaultFilters.push("stock.is_in_stock")
        Object.keys(entities.attribute).map(name=>defaultFilters.push(`${entities.attribute[name].attribute_code}`))
        fs.writeFile(`${CONFIG_PATH}/defaultFilters.json`, JSON.stringify(defaultFilters), () => console.log(`Config file wrote to ${CONFIG_PATH}`))

        // fs.writeFile(`${RESULTS_PATH}/attributes-ids.json`, JSON.stringify(Object.keys(entities.attribute)), () => console.log(`Attributes ids wrote`))
        // fs.writeFile(`${RESULTS_PATH}/attributes-codes.json`, JSON.stringify(Object.keys(entities.attribute).map(attr=>`attr_${attr}`)), () => console.log(`Attributes ids wrote`))
    }

    return {
        run,
        purge: () => {

        }
    }

}
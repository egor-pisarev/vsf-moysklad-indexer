const FILE_PATH = `${__dirname}/../../../var/results`
const fs = require('fs')

module.exports = (config, utils) => {

    const run = async (entities) => {
        fs.writeFile(`${FILE_PATH}/attributes-ids.json`, JSON.stringify(Object.keys(entities.attribute)), () => console.log(`Attributes ids wrote`))
    }

    return {
        run,
        purge: () => {

        }
    }

}
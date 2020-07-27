const es = require('elasticsearch')

module.exports = (config) => {

    const client = new es.Client({
        host: config.elasticsearch.host,
        log: 'error',
        apiVersion: '5.5',
        requestTimeout: 10000
    })

    return {
        client
    }
    
}
const es = require('elasticsearch')

module.exports = (config) => {

    const client = new es.Client({
        host: config.elasticsearch.host,
        log: 'error',
        apiVersion: '7.3',
        requestTimeout: 10000
    })

    return {
        client
    }
    
}
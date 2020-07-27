
module.exports = {
    client: (config) => {
        return require('graphql-client')({
            url: config.cartcl.url,
            // headers: {
            //     Authorization: 'Bearer ' + 
            // }
        })
    }
}
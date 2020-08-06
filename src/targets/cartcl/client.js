
const clientFactory = require('graphql-client')

module.exports = {
    client: (config) => {

        let client = clientFactory({
            url: config.cartcl.url,
        })

        const auth = async () => {
            const {data} = await client.query(`
            mutation($input: AuthInput!) {
                login(input: $input){
                    token
                }
            }`, {
                input: {
                    email: config.cartcl.email,
                    password: config.cartcl.password
                }
            })

            client = clientFactory({
                url: config.cartcl.url,
                headers: {
                    authorization: `Bearer ${data.login.token}`
                }
            })
        }

        return {
            query: async (query, variables, onResponse) => {
                return client.query(query, variables, onResponse).then(result => {
                    if (result.errors && result.errors[0].extensions.code === 'UNAUTHENTICATED') {
                        return auth().then(r => client.query(query, variables, onResponse))
                    }
                    return result
                })
            }
        }

    }
}
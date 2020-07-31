
const { client } = require('./client')

module.exports = (config, utils) => {

    const cli = client(config)

    const query = async (q, params, cb) => {
        const { data, errors } = await cli.query(q, params, function (req, res) {
            if (res.status === 401) {
                throw new Error('Not authorized')
            }
        })

        if (errors) {
            console.log(errors)
            throw new Error('GraphQL errors')
        }

        return cb ? cb(data) : data
    }

    const loadProduct = async (item) => {
        return query(`mutation($updateProductInput: UpdateProductInput!) {
        updateProduct(input: $updateProductInput) {
            providerId,
            name,
            price
        }
    }`, {
            updateProductInput: {
                name: item.name,
                providerId: item.providerId,
                price: item.price,
                qty: item.qty
            }
        })
    }

    const loadProducts = async (items) => {

        for (let i in items) {

            let element = items[i]

            if (element.configurable_children) {

                for (let j in element.configurable_children) {
                    let child = element.configurable_children[j]
                    let result = await loadProduct(child)
                    utils.logger.info(`Product updated ${result.updateProduct.providerId}`)
                }

            } else {
                await loadProduct(element)
            }
        }

    }

    const loadCustomer = async (item) => {
        return query(`mutation($updateCustomerInput: UpdateCustomerInput!) {
        updateCustomer(input: $updateCustomerInput) {
            providerId,
            email,
            phone,
            name
        }
    }`, {
            updateCustomerInput: {
                email: item.email,
                providerId: item.providerId,
                phone: item.phone,
                name: item.name
            }
        })
    }

    const loadCustomers = async (items) => {
        for (let i in items) {
            await loadCustomer(items[i])
        }
    }

    const run = async (entities) => {
        await loadProducts(entities.product)
        await loadCustomers(entities.customer)
    }

    return {
        run,
        purge: () => { }
    }

}
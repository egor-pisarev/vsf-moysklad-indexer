
const { client } = require('./client')

module.exports = (config, utils) => {

    const cli = client(config)

    const query = async (q, params, cb) => {

        const { data, errors } = await cli.query(q, params)

        if (errors) {
            console.log(errors)
            throw new Error('GraphQL errors')
        }

        return cb ? cb(data) : data
    }

    const loadProduct = async (item, type) => {
        return query(`mutation($updateProductInput: UpdateProductInput!) {
        updateProduct(input: $updateProductInput) {
            providerId,
            name,
            price,
            type
        }
    }`, {
            updateProductInput: {
                name: item.name,
                providerId: item.providerId,
                price: item.price,
                qty: item.qty,
                type
            }
        })
    }

    const loadProducts = async (items) => {

        for (let i in items) {

            let element = items[i]

            if (element.configurable_children) {

                for (let j in element.configurable_children) {
                    let child = element.configurable_children[j]
                    let result = await loadProduct(child, 'configurable')
                    utils.logger.info(`Configurable product updated ${result.updateProduct.providerId}`)
                }

            } else {
                let result = await loadProduct(element, 'simple')
                utils.logger.info(`Simple product updated ${result.updateProduct.providerId}`)
            }
        }

    }

    const loadCustomer = async (item) => {

        const [firstname, lastname] = item.name.split(' ')

        return query(`mutation($updateCustomerInput: UpdateCustomerInput!) {
        updateCustomer(input: $updateCustomerInput) {
            email,
            phone,
            firstname,
            lastname
        }
    }`, {
            updateCustomerInput: {
                email: item.email,
                providerId: item.providerId,
                phone: item.phone,
                firstname,
                lastname
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
// require('./src').purge().then(r => require('./src').run()).then(r => console.log(r))

// const config = require('./config.json')
// const { error } = require('winston')
// const { client } = require('./src/targets/cartcl/client')

// client(config).query(`mutation($updateProductInput: UpdateProductInput!) {
//     updateProduct(input: $updateProductInput) {
//         providerId,
//         name,
//         price,
//         type
//     }
// }`, {
//         updateProductInput: {
//             name: '777',
//             providerId: '777',
//             price: 777,
//             qty: 777,
//             type: '777'
//         }
//     }).then(r => console.log('rrr',r)).catch(err => console.log('err',err))


require('./src').run().then(r => {
    console.log('Ready')
    process.exit(0)
})
require('dotenv').config()

const MoyskladCore = require('moysklad')
const nodeFetch = require('node-fetch')
const MoyskladQueueExtension = require('moysklad-extension-queue')
 
const Moysklad = MoyskladCore.compose(MoyskladQueueExtension)
 
const ms = Moysklad({
  queue: true,
  fetch: nodeFetch
})

const indexer = async () => {
  const products = await ms.GET(['entity', 'product'])
  console.log(products)
}

indexer()
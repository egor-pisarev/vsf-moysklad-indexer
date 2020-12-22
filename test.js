const config = require('./config.json')
const utils = require('./src/utils/')

const axios = require('axios')

const msParser = require('./src/sources/ms/parser')(config, utils)
const FormData = require('form-data')
const fs = require('fs')

const rest = require('restler');

const easyvk = require("easyvk")

let entities = {}

// Promise.all([
//   msParser(),
// ]).then(r => {
//   r.map(entitiesItem => {
//     entities = { ...entities, ...entitiesItem }
//   })

//   console.log(entities['product'])

//   process.exit

// })

//https://oauth.vk.com/access_token?client_id=3470519&client_secret=L1sVwRKNKcDCwad0Vdat&redirect_uri=https://webi.ge&code=913f777a7f8934a20b

//c9a7f949f19447d4da508a5bf702ad88daaee4a8605a7b5c980822249a91256ebdc3f415bfff182d902ec

//https://api.vk.com/method/METHOD_NAME?PARAMETERS&access_token=ACCESS_TOKEN&v=V


//https://oauth.vk.com/authorize?client_id=3470519&redirect_uri=https://webi.ge&scope=market,photos&response_type=code


const request = async (method, params) => {
  const defaultParams = {
    access_token: '88c4fc9322987719ba64affe63dabe099dc8da0d1eb67224512890601f81c932285848c5a8e8d658509c0',
    owner_id: -110042087,
  }

  params = { ...defaultParams, ...params }

  let query = '?v=5.131'

  for (let name in params) {
    query = `${query}&${name}=${params[name]}`
  }

  try {
    return axios.post(encodeURI(`https://api.vk.com/method/${method}${query}`))
  } catch (err) {
    console.log(err.request.data)
  }
}

const addProduct = async () => {

  const params = {
    name: 'Базовый пакет Создание сайтов',
    description: 'Базовый пакет Создание сайтов для бизнеса',
    category_id: 8,
    price: 100000,
    old_price: 150000,
    deleted: 0,
    sku: '1233'
  }

  return request('market.add', params)

}

const addPhoto = async () => {

  const filename = 'puck_09_titul.jpg'
  const PATH_TO_FILE = `${__dirname}/var/assets/${filename}`

  const server = await request('photos.getMarketUploadServer', {
    main_photo: 1,
    group_id: 110042087
  })


  rest.post(server.data.response.upload_url, {
    multipart: true,
    data: {
      'file': rest.file(PATH_TO_FILE, null, fs.statSync(PATH_TO_FILE).size, null, 'image/jpg')
    }
  }).on('complete', function (data) {
    console.log('restler', data);
    res.send(data);
  });


  return;

  const form = new FormData();
  const stream = fs.createReadStream(PATH_TO_FILE);

  form.append('file', stream);

  const formHeaders = form.getHeaders();

  console.log(formHeaders)
  return axios.post(server.data.response.upload_url, form, {
    headers: {
      "Content-Type": `multipart/form-data`,
      "Content-Length": fs.statSync(PATH_TO_FILE)['size'],
      "Content-Disposition": `form-data; name="file"; filename="${filename}"`,
      "Content-Type": `image/jpeg`
    },
  })

  //---

  var newFile = fs.createReadStream(__dirname + '/var/assets/puck_09_titul.jpg');
  const bodyFormData = new FormData();

  bodyFormData.append('file', fs.createReadStream(__dirname + '/var/assets/puck_09_titul.jpg'), {
    filename: 'puck_09_titul.jpg'
  });

  axios({
    method: 'post',
    url: server.data.response.upload_url,
    data: bodyFormData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
    .then(function (response) {
      //handle success
      console.log(response);
    })
    .catch(function (response) {
      //handle error
      console.log(response);
    });
}

const addCategory = async () => {

  const categories = await request('market.getCategories', {
    count: 87
  })

  return categories.data.response.items



  // market.getCategories

  // const params = {
  //   name: 'Базовый пакет Создание сайтов',
  //   description: 'Базовый пакет Создание сайтов для бизнеса',
  //   category_id: 1,
  //   price: 100000,
  //   old_price: 150000,
  //   deleted: 0,
  //   sku: '1233'
  // }

  // return request('market.add', params)

}

addPhoto().then(r => { console.log(r) })

//addCategory().then(r => { console.log(r) })

// addProduct().then(r => {
//   console.log(r)
// })






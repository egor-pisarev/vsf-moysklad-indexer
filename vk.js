
const token = '88c4fc9322987719ba64affe63dabe099dc8da0d1eb67224512890601f81c932285848c5a8e8d658509c0'

const easyvk = require('easyvk')
const path = require('path')
const sessionFile = path.join(__dirname, '.session-vk')

const filename = 'puck_09_titul.jpg'
const PATH_TO_FILE = `${__dirname}/var/assets/${filename}`

const group_id = 110042087

easyvk({
  token,
  v: '5.131',
  mode: {
    name: 'highload',
    timeout: 15
  },
  sessionFile,
  save: true,
  clientId: '3470519',
  clientSecret: 'L1sVwRKNKcDCwad0Vdat',
}).then(async vk => {

  const photo = await vk.uploader.upload({
    getUrlMethod: "photos.getMarketUploadServer",
    getUrlParams: {
      group_id
    },
    saveMethod: "photos.saveMarketPhoto",
    saveParams: {
      group_id,
    },
    file: PATH_TO_FILE
  })

  console.log(photo[0].id)

  const params = {
    name: 'Базовый пакет Создание сайтов',
    description: 'Базовый пакет Создание сайтов для бизнеса',
    category_id: 8,
    price: 100000,
    old_price: 150000,
    deleted: 0,
    sku: '1233',
    main_photo_id: photo[0].id
  }

  const product = await vk.post("market.add", {
    owner_id: -group_id,
    ...params
  })

  console.log(product)

  return product

}).catch(err => {
  console.log(err)
})
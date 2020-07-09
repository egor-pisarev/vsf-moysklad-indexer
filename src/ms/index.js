require('dotenv').config()

const parser = require('./parser')

module.exports = function () {

  const test = async () => {
    return parser()
  }

  return {
    test
  }
}
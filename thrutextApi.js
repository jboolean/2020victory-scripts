const axios = require('axios');
const {
  THRUTEXT_TOKEN
} = require('./constants');

const thrutextApi = axios.create({
  baseURL: 'https://api.textforvictory2020.com',
  headers: {
    'authorization': `Token token=${THRUTEXT_TOKEN}`
  }
});

module.exports = thrutextApi;
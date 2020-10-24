const axios = require('axios');

const thrutextApi = axios.create({
  baseURL: 'https://api.textforvictory2020.com',
  headers: {
    'authorization': 'Token token=***REMOVED***'
  }
});

module.exports = thrutextApi;
const thrutextApi = require('./thrutextApi');

function getAccountUsersPage(accountId, pageNumber, pageSize) {
  return thrutextApi.get(`/v1/accounts/${accountId}/account_users`, {
    params: {
      'page[number]': pageNumber,
      'page[size]': pageSize,
      'include': 'user'
    }
  });
}

module.exports = {
  getAccountUsersPage
};
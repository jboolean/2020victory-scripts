const thrutextApi = require('./thrutextApi');
const { ACCOUNT_ID } = require('./constants');

async function hasCampaigns(accountUserId) {
  const resp = await thrutextApi.get(`/v1/accounts/${ACCOUNT_ID}/account_users/${accountUserId}`, {
    params: {
      include: 'campaign_account_users'
    }
  });

  const numCampaigns = resp.data.data.relationships.campaign_account_users.data.length;
  return numCampaigns > 0;
}

module.exports = hasCampaigns;
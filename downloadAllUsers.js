const { getAccountUsersPage } = require('./accountUsersApi');
const thrutextApi = require('./thrutextApi');
const { ACCOUNT_ID } = require('./constants');
const fs = require('fs');
const path = require('path');

const accountUserIdToUserId = new Map();
const userIdToAuId = new Map();
const userSummaries = new Set();

/*
This script downloads summaries of all Thrutext users into a file users.json.
 */

function processPage(page) {
  // First, process the au data to get au to u mappings
  page.data.forEach(accountUser => {
    const auId = accountUser.id;
    const userId = accountUser.attributes.user_id;
    accountUserIdToUserId.set(auId, userId);
    userIdToAuId.set(userId, auId);
  });

  page.included
    .filter((included) => included.type === 'user')
    .forEach(user => {
      const { email, first_name: firstName, last_name: lastName } = user.attributes;
      const userId = user.id;
      const accountUserId = userIdToAuId.get(userId);
      const userSummary = {
        accountUserId, userId, email, firstName, lastName,
      };
      // console.log(userSummary);
      userSummaries.add(userSummary);
    });

}

function finish() {
  console.log('Exporting ' + userSummaries.size + ' users');
  fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify([...userSummaries]));
}

(async () => {
  let auPageResp = await getAccountUsersPage(ACCOUNT_ID, 1, 1000);

  do {
    const page = auPageResp.data;
    console.log(`Processing page ${page.meta.current_page} / ${page.meta.total_pages}`);
    processPage(page);

    // get next page
    if (page.links.next) {
      auPageResp = await thrutextApi.get(page.links.next);
    } else {
      auPageResp = null;
    }
  } while (auPageResp);

  finish();
})();

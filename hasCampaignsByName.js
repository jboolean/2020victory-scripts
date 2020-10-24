const hasCampaigns = require('./hasCampaigns');
const { getUserByFullName } = require('./lookupUser');

(async () => {
  const fullName = process.argv[2];
  const user = getUserByFullName(fullName);
  if (!user) {
    console.error('User not found');
    return;
  }
  const userHasCampaigns = await hasCampaigns(user.accountUserId);
  console.log(userHasCampaigns);
})();
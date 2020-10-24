const fs = require('fs');
const path = require('path');

const userSummaries = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'))));

const userByFullName = new Map();

for (const userSummary of userSummaries) {
  const fullName = `${userSummary.firstName} ${userSummary.lastName}`;
  userByFullName.set(fullName, userSummary);
}

function getUserByFullName(fullName) {
  return userByFullName.get(fullName);
}

module.exports = {
  getUserByFullName
};
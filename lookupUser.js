const fs = require('fs');
const path = require('path');

const userSummaries = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'))));

const userByFullName = new Map();

// names which represent multiple users
const dupeNames = new Set();

for (const userSummary of userSummaries) {
  const fullName = `${userSummary.firstName.trim()} ${userSummary.lastName.trim()}`.toUpperCase();
  if (userByFullName.has(fullName)) {
    dupeNames.add(fullName);
  }
  userByFullName.set(fullName, userSummary);
}

function getUserByFullName(fullName) {
  if (dupeNames.has(fullName)) {
    console.warn('Multiple users with this name', fullName);
    return undefined;
  }
  return userByFullName.get(fullName.toUpperCase());
}

module.exports = {
  getUserByFullName
};
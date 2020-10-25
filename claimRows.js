const getAuthClient = require('./getAuthClient');
const { SWEEPERS_SPREADSHEET, PROMOTIONS_SHEET_NAME, SWEEPER_NAME } = require('./constants');
const { google } = require('googleapis');
const { getUserByFullName } = require('./lookupUser');
const hasCampaigns = require('./hasCampaigns');


/**
 * This takes two arguments: startRow endRow
 * It marks those rows with your name, fills in the thrutext urls, and notes any texters with no linked campaigns.
 */

async function fetchRange(sheets, startRow, endRow) {
  console.log(SWEEPERS_SPREADSHEET);
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: SWEEPERS_SPREADSHEET,
    range: `${PROMOTIONS_SHEET_NAME}!A${startRow}:B${endRow}`
  });
  const values = resp.data.values;

  // Seems to leave out values if they are all empty
  if (!values) {
    return [];
  }
  return values;
}

// Return value range for update or null
async function getUpdateValueRangeForRow(sweeper, texter, rowNum) {
  if (sweeper || !texter) {
    // Skip claimed rows or rows with no texter
    return null;
  }

  const user = getUserByFullName(texter);
  if (!user) {
    console.warn('Missing texter', texter);
    return null;
  }

  const url = `https://democrats.textforvictory2020.com/admin/users/${user.accountUserId}`;

  try {
    const texterHasCampaigns = await hasCampaigns(user.accountUserId);

    if (!texterHasCampaigns) {
      return {
        range: `${PROMOTIONS_SHEET_NAME}!B${rowNum}:E${rowNum}`,
        majorDimension: 'ROWS',
        values: [[SWEEPER_NAME, '', url, 'No linked campaigns']]
      };
    }


    return {
      range: `${PROMOTIONS_SHEET_NAME}!B${rowNum}:D${rowNum}`,
      majorDimension: 'ROWS',
      values: [[SWEEPER_NAME, '', url]]
    };


  } catch (e) {
    console.warn('Error looking up campaigns', e, texter);
    return null;
  }
}

(async () => {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  const startRow = Number(process.argv[2]);
  const endRow = Number(process.argv[3]);
  if (!startRow || !endRow || startRow > endRow) {
    throw new Error('Range required');
  }
  const fetchedRows = await fetchRange(sheets, startRow, endRow);

  const valueRanges = [];

  // For each row in batch
  for (let i = 0; i < fetchedRows.length; i++) {
    const rowNum = i + startRow;
    const [texter, sweeper] = fetchedRows[i];

    // Get update valuerange if there is one
    const maybeValueRange = await getUpdateValueRangeForRow(sweeper, texter, rowNum);
    if (maybeValueRange) {
      valueRanges.push(maybeValueRange);
    }
  } // end of fetchedRows


  // Submit valurange updates in batch
  if (valueRanges.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SWEEPERS_SPREADSHEET,
      requestBody: {
        data: valueRanges,
        valueInputOption: 'USER_ENTERED'
      }
    });
  }

  console.log('DONE.');

})();
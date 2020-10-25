const getAuthClient = require('./getAuthClient');
const { SWEEPERS_SPREADSHEET, PROMOTIONS_SHEET_NAME, SWEEPER_NAME } = require('./constants');
const { google } = require('googleapis');
const hasCampaigns = require('./hasCampaigns');
const { getUserByFullName } = require('./lookupUser');

/**
 * This script takes no arguments and auto-sweeps all unclaimed rows with no linked campaigns.
 */

const BATCH_SIZE = 100;

async function fetchRange(sheets, startRow, endRow) {
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

  try {
    const texterHasCampaigns = await hasCampaigns(user.accountUserId);

    if (!texterHasCampaigns) {

      const url = `https://democrats.textforvictory2020.com/admin/users/${user.accountUserId}`;

      // If texter has no campaigns, update
      return {
        range: `${PROMOTIONS_SHEET_NAME}!B${rowNum}:E${rowNum}`,
        majorDimension: 'ROWS',
        values: [[SWEEPER_NAME, '', url, 'No linked campaigns']]
      };
    }
    return null;


  } catch (e) {
    console.warn('Error looking up campaigns', e, texter);
    return null;
  }
}

async function getTotalRows(sheets) {
  const resp = await sheets.spreadsheets.get({
    spreadsheetId: SWEEPERS_SPREADSHEET,
  });
  const spreadsheet = resp.data;
  const promotionsSheet = spreadsheet.sheets.find((sheet) => sheet.properties.title === PROMOTIONS_SHEET_NAME);
  return promotionsSheet.properties.gridProperties.rowCount;

}

(async () => {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });
  const totalRows = await getTotalRows(sheets);
  let nlcCount = 0;

  let startRow = 3;
  while (startRow <= totalRows) {
    console.log('Starting batch', startRow);
    const fetchedRows = await fetchRange(sheets, startRow, Math.min(totalRows, startRow + BATCH_SIZE - 1));

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
    nlcCount += valueRanges.length;
    if (valueRanges.length) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SWEEPERS_SPREADSHEET,
        requestBody: {
          data: valueRanges,
          valueInputOption: 'USER_ENTERED'
        }
      });
    }


    startRow = startRow + BATCH_SIZE;
  }
  console.log('DONE. Updated ' + nlcCount + ' rows');

})();
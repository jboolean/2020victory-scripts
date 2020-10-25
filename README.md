Various scripts to help with 2020Victory text team.

Written with Node v10

## Environment variables
The scripts expect these environment variables:

- `SWEEPERS_SPREADSHEET` - The id of the "Sweepers" spreadsheet (or a copy thereof). The id is found between `/d/` and `/edit` in the url.
- `SWEEPER_NAME` - Your name.
- `THRUTEXT_TOKEN` - The value of `authToken` when logged into Thrutext. 


## Google Sheets Auth
Follow Step 1 in the [Google Sheets Quickstart Guide](https://developers.google.com/sheets/api/quickstart/nodejs) and place the resulting `credentials.json` in this directory.

## Scripts

### `downloadAllUsers.js`
Downloads summaries of all Thrutext users to a file. *This must be run before other scripts to do lookups by name.*

### `markNlc.js`
Sweeps all unswept texters in the *whole sheet* with no linked campaigns. Doesn't touch any swept rows.

### `claimRows.js startRow endRow`
Adds your name to these rows, enters the Thrutext urls, and makes a note if any have no linked campaigns.
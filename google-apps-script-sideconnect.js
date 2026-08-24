/**
 * GOOGLE APPS SCRIPT FOR SIDE CONNECT REGISTRATION
 * 
 * INSTRUCTIONS:
 * 1. Create a NEW Google Sheet (separate from main ERIC spreadsheet).
 * 2. Copy the Sheet ID from the URL:
 *    https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
 * 3. Paste the Sheet ID below in SPREADSHEET_ID.
 * 4. In the Sheet, go to "Extensions" -> "Apps Script".
 * 5. Delete default code and paste this entire script.
 * 6. Click "Deploy" -> "New deployment".
 * 7. Under "Select type" (gear icon), choose "Web app".
 * 8. Set "Who has access" to "Anyone".
 * 9. Click "Deploy", authorize permissions.
 * 10. Copy the Web App URL and paste it in:
 *     - src/lib/sideConnect.ts (GAS_URL constant)
 *     - OR set via localStorage key 'eric_sideconnect_gas_url'
 * 
 * SPREADSHEET STRUCTURE:
 * - Tab "Creative Innovation": all Creative Innovation registrations
 * - Tab "Research Innovation": all RIC registrations
 * - Tab "Drone Innovation": all Drone Innovation registrations
 * - Each tab has identical headers.
 */

const SPREADSHEET_ID = "PASTE_YOUR_SIDE_CONNECT_SHEET_ID_HERE";

const SUB_COMP_MAP = {
  'creative-innovation': 'Creative Innovation',
  'research-innovation': 'Research Innovation',
  'drone-innovation': 'Drone Innovation',
};

const FULL_HEADERS = [
  "ID", "Timestamp", "Ref Code", "Sub Competition", "Participation Type", "Team Name",
  "Leader Name", "Leader Email", "Leader WhatsApp", "Leader Institution", "Leader Country", "Leader Age",
  "Member 1 Name", "Member 1 Email", "Member 1 WhatsApp", "Member 1 Institution", "Member 1 Country", "Member 1 Age",
  "Member 2 Name", "Member 2 Email", "Member 2 WhatsApp", "Member 2 Institution", "Member 2 Country", "Member 2 Age",
  "Abstract Title", "Product Description", "How It Works", "Product Design", "Benefits", "Experience"
];

function getOrCreateSheet(subCompetition) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetName = SUB_COMP_MAP[subCompetition] || subCompetition;

  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(FULL_HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, FULL_HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#00FF88");
    headerRange.setFontColor("#000000");
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, FULL_HEADERS.length, 150);
  }
  return sheet;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'register') {
      const sheet = getOrCreateSheet(data.subCompetition);

      const row = [
        data.id,
        data.timestamp,
        data.refCode,
        SUB_COMP_MAP[data.subCompetition] || data.subCompetition,
        data.participationType,
        data.teamName,
        data.leaderName,
        data.leaderEmail,
        data.leaderWhatsApp,
        data.leaderInstitution,
        data.leaderCountry,
        data.leaderAge,
        data.m1Name,
        data.m1Email,
        data.m1WhatsApp,
        data.m1Institution,
        data.m1Country,
        data.m1Age,
        data.m2Name,
        data.m2Email,
        data.m2WhatsApp,
        data.m2Institution,
        data.m2Country,
        data.m2Age,
        data.abstractTitle,
        data.productDescription,
        data.howItWorks,
        data.productDesign,
        data.benefits,
        data.experience,
      ];

      sheet.appendRow(row);

      // Color the latest row ID cell
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 1).setFontColor("#00FF88");

      return ContentService.createTextOutput(
        JSON.stringify({ success: true, message: 'Registration saved', refCode: data.refCode })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: 'Unknown action' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getRegistrations') {
    const subComp = e.parameter.subCompetition;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (subComp && SUB_COMP_MAP[subComp]) {
      const sheet = ss.getSheetByName(SUB_COMP_MAP[subComp]);
      if (!sheet) {
        return ContentService.createTextOutput(
          JSON.stringify({ success: true, data: [] })
        ).setMimeType(ContentService.MimeType.JSON);
      }
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = row[i]; });
        return obj;
      });
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, data })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Return all from all tabs
    const allData = {};
    for (const [key, name] of Object.entries(SUB_COMP_MAP)) {
      const sheet = ss.getSheetByName(name);
      if (sheet) {
        const rows = sheet.getDataRange().getValues();
        const headers = rows[0];
        allData[key] = rows.slice(1).map(row => {
          const obj = {};
          headers.forEach((h, i) => { obj[h] = row[i]; });
          return obj;
        });
      } else {
        allData[key] = [];
      }
    }
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, data: allData })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ success: false, message: 'No action specified. Use ?action=getRegistrations' })
  ).setMimeType(ContentService.MimeType.JSON);
}

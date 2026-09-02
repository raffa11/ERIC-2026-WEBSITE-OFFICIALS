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
  "Abstract Title", "Product Description", "How It Works", "Product Design", "Benefits", "Experience",
  "Report Files"
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
        data.reportFiles ? String(data.reportFiles) : '',
      ];

      sheet.appendRow(row);

      // Color the latest row ID cell
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 1).setFontColor("#00FF88");

      return ContentService.createTextOutput(
        JSON.stringify({ success: true, message: 'Registration saved', refCode: data.refCode })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'uploadFiles') {
      return handleUploadFiles(data);
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

/** Response helper — GAS Web App needs the JSON mime type to return JSONP/text. */
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Ensure a column exists by header name; returns 1-based column index. */
function ensureColumn(sheet, name) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(h => String(h).trim());
  const existing = headers.indexOf(name);
  if (existing >= 0) return existing + 1;
  const col = headers.length + 1;
  const cell = sheet.getRange(1, col);
  cell.setValue(name);
  cell.setFontWeight('bold');
  cell.setBackground('#00FF88');
  cell.setFontColor('#000000');
  return col;
}

/** Create (or reuse) the "UPLOAD LOG" tab and append a row so every upload
 *  attempt (success or failure + reason) is visible even when the frontend
 *  uses no-cors (which silently hides GAS responses/errors). */
function logUpload(refCode, status, message, fileNames) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let log = ss.getSheetByName('UPLOAD LOG');
    if (!log) {
      log = ss.insertSheet('UPLOAD LOG');
      log.appendRow(['Timestamp', 'Ref Code', 'Status', 'Message', 'Files']);
      const h = log.getRange(1, 1, 1, 5);
      h.setFontWeight('bold');
      h.setBackground('#FFB300');
      h.setFontColor('#000000');
    }
    log.appendRow([
      new Date(),
      refCode || '',
      status,
      message || '',
      Array.isArray(fileNames) ? fileNames.join(', ') : String(fileNames || ''),
    ]);
  } catch (err) {
    // Logging must never break the upload flow.
    console.error('logUpload failed:', err.toString());
  }
}

/** Create (or reuse) a Drive folder per ref code under a shared "SIDE CONNECT" folder. */
function getSideConnectFolder(refCode) {
  const rootName = 'SIDE CONNECT FILES';
  let root = null;
  const it = DriveApp.getFoldersByName(rootName);
  if (it.hasNext()) root = it.next();
  else root = DriveApp.createFolder(rootName);

  const subName = refCode;
  const subIt = root.getFoldersByName(subName);
  if (subIt.hasNext()) return subIt.next();
  return root.createFolder(subName);
}

function handleUploadFiles(data) {
  const refCode = String(data.refCode || '').trim().toUpperCase();
  const fileNames = (Array.isArray(data.files) ? data.files : []).map(f => f && f.name).filter(Boolean);

  if (!refCode) {
    logUpload('', 'ERROR', 'Missing refCode', fileNames);
    return json({ success: false, message: 'Missing refCode' });
  }

  const files = Array.isArray(data.files) ? data.files : [];
  if (files.length === 0) {
    logUpload(refCode, 'ERROR', 'No files provided', []);
    return json({ success: false, message: 'No files provided' });
  }

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Locate the participant row by ref code across all sub-competition tabs.
    const tabs = Object.values(SUB_COMP_MAP);
    let sheet = null;
    let rowNum = -1;
    for (let t = 0; t < tabs.length && !sheet; t++) {
      const s = ss.getSheetByName(tabs[t]);
      if (!s) continue;
      const rows = s.getDataRange().getValues();
      const headers = rows[0].map(h => String(h).trim());
      const ri = headers.indexOf('Ref Code');
      if (ri < 0) continue;
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][ri]).trim().toUpperCase() === refCode) {
          sheet = s; rowNum = i + 1;
          break;
        }
      }
    }
    if (!sheet) {
      logUpload(refCode, 'ERROR', 'Ref code not found in any tab', fileNames);
      return json({ success: false, message: 'Ref code not found' });
    }

    const folder = getSideConnectFolder(refCode);
    const links = [];
    for (const f of files) {
      if (!f || !f.data) continue;
      const bytes = Utilities.base64Decode(String(f.data));
      const blob = Utilities.newBlob(bytes, f.mimeType || 'application/octet-stream', f.name || 'file');
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      links.push({ name: f.name, url: file.getUrl(), id: file.getId() });
    }
    if (links.length === 0) {
      logUpload(refCode, 'ERROR', 'No valid files (empty/decode failed)', fileNames);
      return json({ success: false, message: 'No valid files' });
    }

    const col = ensureColumn(sheet, 'Report Files');
    const existing = sheet.getRange(rowNum, col).getValue();
    const fresh = existing ? String(existing) + '\n' : '';
    sheet.getRange(rowNum, col).setValue(fresh + links.map(l => l.url).join('\n'));

    logUpload(refCode, 'OK', 'Uploaded ' + links.length + ' file(s) to row ' + rowNum, links.map(l => l.name));
    return json({ success: true, message: 'Uploaded ' + links.length + ' file(s)', files: links });
  } catch (err) {
    // CATCH-ALL: guarantees the real failure reason is never hidden. If Drive
    // permission is missing (DriveApp scope not re-authorized), a base64 error,
    // or any other exception, it is recorded to the UPLOAD LOG tab.
    console.error('handleUploadFiles error:', err.toString());
    logUpload(refCode, 'ERROR', 'Exception: ' + err.toString(), fileNames);
    if (String(err).indexOf('DriveApp') >= 0 || String(err).indexOf('permission') >= 0) {
      logUpload(refCode, 'ERROR', 'DRIVE SCOPE LIKELY MISSING - reauthorize DriveApp', fileNames);
    }
    return json({ success: false, message: err.toString() });
  }
}

function doGet(e) {
  const action = e.parameter.action;

  // Version check that works from a plain browser tab (GET is not blocked by
  // CORS). Open ?action=debug to confirm the DEPLOYED code actually contains
  // the uploadFiles handler and the logUpload helper.
  if (action === 'debug') {
    const info = {
      success: true,
      deployedWith: 'UPLOAD-LOG+V2',
      hasUploadFilesHandler: typeof handleUploadFiles === 'function',
      hasLogUpload: typeof logUpload === 'function',
      hasRegisterAction: typeof doPost === 'function',
      tabs: Object.values(SUB_COMP_MAP),
      spreadsheetIdSet: SPREADSHEET_ID !== 'PASTE_YOUR_SIDE_CONNECT_SHEET_ID_HERE',
    };
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      info.sheetAccessible = true;
      info.sheetTabs = ss.getSheets().map(s => s.getName());
      info.hasUploadLogTab = ss.getSheetByName('UPLOAD LOG') !== null;
    } catch (err) {
      info.sheetAccessible = false;
      info.sheetError = err.toString();
    }
    return ContentService.createTextOutput(JSON.stringify(info))
      .setMimeType(ContentService.MimeType.JSON);
  }

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

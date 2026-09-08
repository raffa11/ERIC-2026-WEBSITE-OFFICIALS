/**
 * GOOGLE APPS SCRIPT — SIDE CONNECT v2
 * =====================================
 * NEW Sheet + Clean deployment (data lama tetap aman di sheet lama).
 *
 * SETUP:
 * 1. Buat Google Sheet BARU (bukan sheet lama).
 * 2. Copy Sheet ID dari URL:
 *    https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
 * 3. Paste di bawah → SPREADSHEET_ID.
 * 4. Di Sheet → Extensions → Apps Script → hapus default code → paste ini.
 * 5. Jalankan fungsi setupSecurityV2() dari editor (satu kali).
 * 6. Deploy → New deployment → Web app → Anyone can access → Deploy.
 * 7. Copy URL deploy → paste di:
 *    src/lib/sideConnect.ts (GAS_URL)
 *    ATAU set via localStorage: eric_sideconnect_gas_url
 *
 * SECURITY v2:
 * - Admin token di Script Properties (bukan hardcoded).
 * - getRegistrations & debug WAJIB token admin.
 * - register & uploadFiles terbuka untuk peserta tapi TELITI divalidasi.
 * - File upload = PRIVATE (tidak share publik).
 * - Duplikat refCode DITOLAK.
 * - Email wajib valid format.
 * - Log semua upload (sukses + gagal).
 */

// ============================================================
// CONFIGURATION — paste Sheet ID baru Anda di sini
// ============================================================
const SPREADSHEET_ID = '1QFXSzf1BqY9OudpgnVW9R4-iPQtS_LYP9CMqM5YyDSA';

// ============================================================
// SECURITY — token admin via Script Properties
// ============================================================
function getAdminToken() {
  try {
    return PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN') || '';
  } catch (e) {
    return '';
  }
}

function tokenIsValid(token) {
  if (!token) return false;
  const valid = getAdminToken();
  if (!valid) return false;
  if (String(token).length !== String(valid).length) return false;
  let diff = 0;
  for (let i = 0; i < String(token).length; i++) {
    diff |= String(token).charCodeAt(i) ^ String(valid).charCodeAt(i);
  }
  return diff === 0;
}

/** ONE-TIME SETUP — jalankan dari editor utk set ADMIN_TOKEN. */
function setupSecurityV2() {
  const ui = SpreadsheetApp.getUi();
  const current = getAdminToken();
  const res = ui.prompt(
    'ERIC Side Connect v2 — Security Setup',
    'Masukkan ADMIN TOKEN (minimal 16 karakter, acak).' +
    (current ? ' Token lama ada. Kosongkan utk pertahankan.' : ''),
    ui.ButtonSet.OK_CANCEL
  );
  if (res.getSelectedButton() !== ui.Button.OK) {
    Logger.log('Setup dibatalkan.');
    return;
  }
  const input = String(res.getResponseText() || '').trim();
  if (input && input.length >= 16) {
    PropertiesService.getScriptProperties().setProperty('ADMIN_TOKEN', input);
    Logger.log('ADMIN_TOKEN disimpan. Token aktif.');
    SpreadsheetApp.getUi().alert('ADMIN_TOKEN berhasil disimpan!');
  } else if (input && input.length < 16) {
    Logger.log('Token terlalu pendek. Minimal 16 karakter.');
    SpreadsheetApp.getUi().alert('Token terlalu pendek! Minimal 16 karakter.');
  } else if (!current) {
    Logger.log('Tidak ada token — getRegistrations akan DITOLAK.');
    SpreadsheetApp.getUi().alert('Tidak ada token. Akses data admin akan ditolak.');
  }
}

// ============================================================
// CONSTANTS
// ============================================================
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const SUB_COMP_MAP = {
  'creative-innovation': 'Creative Innovation',
  'research-innovation': 'Research Innovation',
  'drone-innovation': 'Drone Innovation',
};

const FULL_HEADERS = [
  'ID', 'Timestamp', 'Ref Code', 'Sub Competition', 'Participation Type', 'Team Name',
  'Leader Name', 'Leader Email', 'Leader WhatsApp', 'Leader Institution', 'Leader Country', 'Leader Age',
  'Member 1 Name', 'Member 1 Email', 'Member 1 WhatsApp', 'Member 1 Institution', 'Member 1 Country', 'Member 1 Age',
  'Member 2 Name', 'Member 2 Email', 'Member 2 WhatsApp', 'Member 2 Institution', 'Member 2 Country', 'Member 2 Age',
  'Abstract Title', 'Product Description', 'How It Works', 'Product Design', 'Benefits', 'Experience',
  'Report Files',
];

// ============================================================
// HELPERS
// ============================================================
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(subCompetition) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetName = SUB_COMP_MAP[subCompetition] || subCompetition;
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(FULL_HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, FULL_HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#00FF88');
    headerRange.setFontColor('#000000');
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, FULL_HEADERS.length, 150);
  }
  return sheet;
}

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
    console.error('logUpload failed:', err.toString());
  }
}

function getSideConnectFolder(refCode) {
  const rootName = 'SIDE CONNECT FILES v2';
  let root = null;
  const it = DriveApp.getFoldersByName(rootName);
  if (it.hasNext()) root = it.next();
  else root = DriveApp.createFolder(rootName);

  const subIt = root.getFoldersByName(refCode);
  if (subIt.hasNext()) return subIt.next();
  return root.createFolder(refCode);
}

// ============================================================
// doPost — register + uploadFiles
// ============================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // --- ACTION: register ---
    if (data.action === 'register') {
      // Wajib ada
      if (!data.id || !data.subCompetition || !data.leaderEmail || !data.refCode) {
        return json({ success: false, message: 'Missing required fields (id, subCompetition, leaderEmail, refCode)' });
      }
      // Email valid
      if (!EMAIL_RE.test(String(data.leaderEmail))) {
        return json({ success: false, message: 'Invalid leader email format' });
      }
      // SubCompetition whitelist
      const tabName = SUB_COMP_MAP[data.subCompetition];
      if (!tabName) {
        return json({ success: false, message: 'Unknown subCompetition' });
      }
      // Ref Code: 6 karakter alphanumeric
      const ref = String(data.refCode).trim().toUpperCase();
      if (ref.length < 4 || ref.length > 8 || !/^[A-Z0-9]+$/.test(ref)) {
        return json({ success: false, message: 'Invalid refCode format' });
      }
      // Cek duplikat di semua tab
      const ssx = SpreadsheetApp.openById(SPREADSHEET_ID);
      let existingRefForId = null;
      for (const [, name] of Object.entries(SUB_COMP_MAP)) {
        const s = ssx.getSheetByName(name);
        if (!s || s.getLastRow() <= 1) continue;
        const rows = s.getDataRange().getValues();
        const headers = rows[0].map(h => String(h).trim());
        const iRef = headers.indexOf('Ref Code');
        const iId = headers.indexOf('ID');
        if (iRef < 0) continue;
        for (let i = 1; i < rows.length; i++) {
          const existingRef = String(rows[i][iRef]).trim().toUpperCase();
          const existingId = iId >= 0 ? String(rows[i][iId]).trim() : '';
          if (existingRef === ref) {
            return json({ success: false, message: 'Duplicate refCode' });
          }
          if (existingId === String(data.id).trim()) {
            // Row sudah pernah ditulis (mis. klien timeout setelah server simpan).
            // Jangan tolak — kembalikan refCode yang sudah ada agar idempoten.
            existingRefForId = existingRef || ref;
            break;
          }
        }
        if (existingRefForId) break;
      }
      if (existingRefForId) {
        return json({ success: true, message: 'Already registered', refCode: existingRefForId, already: true });
      }

      const sheet = getOrCreateSheet(data.subCompetition);

      const row = [
        data.id,
        data.timestamp,
        ref,
        tabName,
        data.participationType || '-',
        data.teamName || '-',
        data.leaderName || '-',
        data.leaderEmail,
        data.leaderWhatsApp || '-',
        data.leaderInstitution || '-',
        data.leaderCountry || '-',
        data.leaderAge || '-',
        data.m1Name || '-',
        data.m1Email || '-',
        data.m1WhatsApp || '-',
        data.m1Institution || '-',
        data.m1Country || '-',
        data.m1Age || '-',
        data.m2Name || '-',
        data.m2Email || '-',
        data.m2WhatsApp || '-',
        data.m2Institution || '-',
        data.m2Country || '-',
        data.m2Age || '-',
        data.abstractTitle || '-',
        data.productDescription || '-',
        data.howItWorks || '-',
        data.productDesign || '-',
        data.benefits || '-',
        data.experience || '-',
        '',
      ];

      sheet.appendRow(row);

      // Highlight ref code
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 3).setFontColor('#00FF88');

      return json({ success: true, message: 'Registration saved', refCode: ref });
    }

    // --- ACTION: uploadFiles ---
    if (data.action === 'uploadFiles') {
      return handleUploadFiles(data);
    }

    return json({ success: false, message: 'Unknown action' });
  } catch (err) {
    return json({ success: false, message: err.toString() });
  }
}

// ============================================================
// handleUploadFiles — save files to Drive (PRIVATE)
// ============================================================
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

    // Find participant row by refCode across all tabs
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
          sheet = s;
          rowNum = i + 1;
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
      // PRIVATE — tidak share publik
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
    console.error('handleUploadFiles error:', err.toString());
    logUpload(refCode, 'ERROR', 'Exception: ' + err.toString(), fileNames);
    return json({ success: false, message: err.toString() });
  }
}

// ============================================================
// doGet — getRegistrations + debug (WAJIB admin token)
// ============================================================
function doGet(e) {
  const action = e.parameter.action;
  const token = e.parameter.token || '';

  // Admin-only actions
  if (action === 'debug' || action === 'getRegistrations') {
    if (!tokenIsValid(token)) {
      return json({ success: false, message: 'Forbidden: invalid access token' });
    }
  }

  if (action === 'debug') {
    const info = {
      success: true,
      version: 'SIDE-CONNECT-V2',
      hasUploadFilesHandler: typeof handleUploadFiles === 'function',
      hasLogUpload: typeof logUpload === 'function',
      hasRegisterAction: typeof doPost === 'function',
      tabs: Object.values(SUB_COMP_MAP),
      spreadsheetIdSet: SPREADSHEET_ID !== 'PASTE_YOUR_NEW_SHEET_ID_HERE',
    };
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      info.sheetAccessible = true;
      info.sheetTabs = ss.getSheets().map(s => s.getName());
      info.hasUploadLogTab = ss.getSheetByName('UPLOAD LOG') !== null;
      // Count rows per tab
      info.rowCounts = {};
      for (const [key, name] of Object.entries(SUB_COMP_MAP)) {
        const s = ss.getSheetByName(name);
        info.rowCounts[key] = s ? Math.max(0, s.getLastRow() - 1) : 0;
      }
    } catch (err) {
      info.sheetAccessible = false;
      info.sheetError = err.toString();
    }
    return json(info);
  }

  if (action === 'getRegistrations') {
    const subComp = e.parameter.subCompetition;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Single tab
    if (subComp && SUB_COMP_MAP[subComp]) {
      const sheet = ss.getSheetByName(SUB_COMP_MAP[subComp]);
      if (!sheet) return json({ success: true, data: [] });
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = row[i]; });
        return obj;
      });
      return json({ success: true, data });
    }

    // All tabs
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
    return json({ success: true, data: allData });
  }

  return json({ success: false, message: 'No action specified. Use ?action=getRegistrations' });
}

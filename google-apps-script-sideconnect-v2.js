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
 * 4. Di Sheet → Extensions → Apps Script → hapus semua code → paste ini.
 * 5. Deploy → Manage deployments → edit → New version (JANGAN New deployment).
 * 6. Pastikan deployment URL-nya:
 *    src/lib/sideConnect.ts (GAS_URL)
 *    ATAU set via localStorage: eric_sideconnect_gas_url
 *
 * SECURITY v2:
 * - Semua action TERBUKA (tanpa token) — keputusan user, ini side event gratis.
 * - register & uploadFiles tetap divalidasi ketat.
 * - File upload = PRIVATE (tidak share publik).
 * - Duplikat refCode DITOLAK.
 * - Email wajib valid format.
 * - Log semua upload (sukses + gagal).
 */

// ============================================================
// CONFIGURATION — paste Sheet ID baru Anda di sini
// ============================================================
const SPREADSHEET_ID = '1QFXSzf1BqY9OudpgnVW9R4-iPQtS_LYP9CMqM5YyDSA';

// Sheet LAMA (legacy) — sumber data untuk action importLegacy.
// Data peserta yang sudah terdaftar di sheet lama akan disalin SATU KALI
// ke SPREADSHEET_ID di atas (ID & refCode dipertahankan).
const LEGACY_SPREADSHEET_ID = '1JdZKshwzduSUAaIJn2qlo2s_UC3MFELsb03n_Zatogk';

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
// doGet — getRegistrations (+filter email) + debug + importLegacy
//   Semua action TERBUKA (tanpa token). Keputusan user: side event gratis.
// ============================================================
function doGet(e) {
  const action = e.parameter.action;
  const email = String(e.parameter.email || '').trim().toLowerCase();

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

    // Helper: ubah baris sheet menjadi objek {header: value} + penanda sub-competition.
    const sheetToObjects = (sheet, key) => {
      if (!sheet) return [];
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0].map(h => String(h).trim());
      const out = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.every(c => c === '' || c === null || c === undefined)) continue;
        const obj = { _subCompetition: key, _tab: SUB_COMP_MAP[key] || key };
        headers.forEach((h, idx) => { obj[h] = row[idx]; });
        out.push(obj);
      }
      return out;
    };

    // Single tab
    if (subComp && SUB_COMP_MAP[subComp]) {
      const sheet = ss.getSheetByName(SUB_COMP_MAP[subComp]);
      let data = sheetToObjects(sheet, subComp);
      if (email) {
        data = data.filter(o => String(o['Leader Email'] || '').trim().toLowerCase() === email);
      }
      return json({ success: true, data });
    }

    // All tabs → flat array (+ filter email publik bila ada)
    const allData = [];
    for (const [key, name] of Object.entries(SUB_COMP_MAP)) {
      let rows = sheetToObjects(ss.getSheetByName(name), key);
      if (email) {
        rows = rows.filter(o => String(o['Leader Email'] || '').trim().toLowerCase() === email);
      }
      allData.push(...rows);
    }
    return json({ success: true, data: allData });
  }

  // --- ACTION: importLegacy — migrasi data dari sheet LAMA (sekali) ---
  if (action === 'importLegacy') {
    return handleImportLegacy();
  }

  return json({ success: false, message: 'No action specified. Use ?action=getRegistrations' });
}

// ============================================================
// handleImportLegacy — salin peserta dari sheet lama ke sheet baru
// ID & refCode dipertahankan; baris yang sudah ada DI-LEWATI (dedupe).
// ============================================================
function handleImportLegacy() {
  const summary = { success: true, message: '', imported: 0, skipped: 0, perTab: {} };
  try {
    const legacySs = SpreadsheetApp.openById(LEGACY_SPREADSHEET_ID);
    const targetSs = SpreadsheetApp.openById(SPREADSHEET_ID);

    for (const [key, name] of Object.entries(SUB_COMP_MAP)) {
      const legacySheet = legacySs.getSheetByName(name);
      const targetSheet = targetSs.getSheetByName(name);
      summary.perTab[key] = { found: false, read: 0, imported: 0, skipped: 0 };

      if (!legacySheet || legacySheet.getLastRow() <= 1) continue;
      summary.perTab[key].found = true;

      // Header lama → posisi slice data
      const legacyRows = legacySheet.getDataRange().getValues();
      const legacyHeaders = legacyRows[0].map(h => String(h).trim());

      // Header target (FULL_HEADERS) → index kolom di sheet lama (kalau ada)
      const srcIndex = {};
      FULL_HEADERS.forEach((h, i) => {
        const idx = legacyHeaders.indexOf(h);
        srcIndex[h] = idx >= 0 ? idx : -1;
      });

      // Kumpulkan refCode & ID yang sudah ada di target utk dedupe
      const seenRefs = new Set();
      const seenIds = new Set();
      if (targetSheet) {
        const tRows = targetSheet.getDataRange().getValues();
        const tHeaders = tRows[0].map(h => String(h).trim());
        const tiRef = tHeaders.indexOf('Ref Code');
        const tiId = tHeaders.indexOf('ID');
        for (let i = 1; i < tRows.length; i++) {
          if (tiRef >= 0) seenRefs.add(String(tRows[i][tiRef]).trim().toUpperCase());
          if (tiId >= 0) seenIds.add(String(tRows[i][tiId]).trim());
        }
      }

      const target = targetSheet || getOrCreateSheet(key);
      let newRows = [];
      for (let i = 1; i < legacyRows.length; i++) {
        const row = legacyRows[i];
        // Lewati baris kosong
        if (!row.some(c => c !== '' && c !== null && c !== undefined)) continue;
        summary.perTab[key].read++;

        const ref = String(srcIndex['Ref Code'] >= 0 ? row[srcIndex['Ref Code']] : '').trim().toUpperCase();
        const id = String(srcIndex['ID'] >= 0 ? row[srcIndex['ID']] : '').trim();

        if (ref && seenRefs.has(ref)) { summary.perTab[key].skipped++; summary.skipped++; continue; }
        if (id && seenIds.has(id)) { summary.perTab[key].skipped++; summary.skipped++; continue; }

        // Bangun baris baru sesuai FULL_HEADERS target
        const newRow = FULL_HEADERS.map((h) => {
          if (h === '_subCompetition' || h === '_tab') return undefined;
          if (h === 'Ref Code') return ref;
          if (srcIndex[h] >= 0) return row[srcIndex[h]];
          return '';
        });
        if (ref) seenRefs.add(ref);
        if (id) seenIds.add(id);
        newRows.push(newRow);
      }

      if (newRows.length > 0) {
        if (newRows.length === 1) {
          target.appendRow(newRows[0]);
        } else {
          target.getRange(target.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
        }
        // Highlight kolom ref code pada baris baru
        if (target.getLastRow() >= 2) {
          target
            .getRange(target.getLastRow() - newRows.length + 1, 3, newRows.length, 1)
            .setFontColor('#00FF88');
        }
        summary.imported += newRows.length;
        summary.perTab[key].imported += newRows.length;
      }
    }

    summary.message =
      'Legacy import selesai: ' + summary.imported + ' baris diimpor, ' +
      summary.skipped + ' di-skip (duplikat/baris kosong). ' +
      JSON.stringify(summary.perTab);
    return json(summary);
  } catch (err) {
    return json({ success: false, message: 'importLegacy gagal: ' + err.toString(), error: err.toString() });
  }
}

/**
* GOOGLE APPS SCRIPT FOR GOOGLE SHEET SYNCHRONIZATION
* 
* INSTRUCTIONS:
* 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/12ouLbtyguh2VWYX0_DQlJUU_KCCEZ4qQBtH0RL2UFP8/edit
* 2. In the top menu, go to "Extensions" -> "Apps Script"
* 3. Delete any default code in Code.gs and paste this entire script.
* 4. Click "Deploy" -> "New deployment"
* 5. Under "Select type" (gear icon), choose "Web app"
* 6. Set "Who has access" to "Anyone"
* 7. Click "Deploy", authorize permissions.
* 8. Copy the Web App URL and paste it in Admin Dashboard.
* 
* FEATURES:
 * - Each competition division gets its own sheet tab
 * - doPost: write new registrations to the correct division tab
 * - doPost action=sendTicket: kirim PDF tiket peserta ke email via MailApp + log status di sheet
 * - doGet: read registrations back from sheets (action=getRegistrations, optional &email=... untuk filter; tanpa email = semua baris / admin)
 * - doGet: action=debugHeaders — return daftar header asli tiap sheet divisi (untuk verifikasi mapping kolom)
 * 
 * PDF TICKET RESCUE (SEND TICKET VIA EMAIL):
 * - Admin Dashboard generate PDF dari data peserta, POST base64 ke web app ini
 *   dengan action="sendTicket", token rahasia, refCode, toEmail, subject, body, pdfBase64.
 * - Jika token cocok, PDF dikirim via MailApp dan kolom "Ticket Email Status"/"Ticket Email Date"
 *   di baris peserta di-update menjadi SENT.
 * - DEFAULT SECRET: "ERIC2026_TICKET_RESCUE" — ganti di const SECRET (handleSendTicket)
 *   DAN di Admin Dashboard (field ADMIN SEND SECRET) agar sama persis.
 */

const SPREADSHEET_ID = "12ouLbtyguh2VWYX0_DQlJUU_KCCEZ4qQBtH0RL2UFP8";

const DIVISION_MAP = {
    'sumobot-500g': 'Sumobot 500g',
    'sumobot-3kg': 'Sumobot 3kg',
    'mini-soccer': 'Mini Soccer',
    'line-follower': 'Line Follower',
    'plc-industrial': 'PLC Industrial',
    'collaborative-robot': 'Collaborative Robot',
    'research-innovation': 'Research Innovation',
    'creative-innovation': 'Creative Innovation',
    'drone-innovation': 'Drone Innovation'
};

function getDivisionSheetName(divisionId) {
    return DIVISION_MAP[divisionId] || divisionId;
}

function getOrCreateDivisionSheet(divisionId) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetName = getDivisionSheetName(divisionId);

    const FULL_HEADERS = [
        "ID", "Timestamp", "Division", "Sub Category", "Level", "Team Name",
        "Leader Name", "Leader Email", "Leader WhatsApp", "Leader Institution", "Leader Address", "Leader Congenital Disease",
        "Leader ID Card", "Leader Twibbon",
        "Member 1 Name", "Member 1 WhatsApp", "Member 1 Disease", "Member 1 ID Card", "Member 1 Twibbon",
        "Member 2 Name", "Member 2 WhatsApp", "Member 2 Disease", "Member 2 ID Card", "Member 2 Twibbon",
        "Lecturer Name", "Lecturer Email", "Lecturer WhatsApp", "Lecturer Disease", "Lecturer ID Card", "Lecturer Twibbon",
        "Payment Method", "Payment Status", "Amount Paid", "Ref Code", "Payment Proof",
        "Ticket Email Status", "Ticket Email Date"
    ];

    let sheet = ss.getSheetByName(sheetName);
    if (sheet) {
        // Ensure existing sheets have the "Payment Proof" column
        const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        if (!existingHeaders.includes("Payment Proof")) {
            const newCol = existingHeaders.length + 1;
            sheet.getRange(1, newCol).setValue("Payment Proof");
            sheet.getRange(1, newCol).setFontWeight("bold");
            sheet.getRange(1, newCol).setBackground("#FFD700");
            sheet.getRange(1, newCol).setFontColor("#000000");
        }
        ensureTicketLogColumns(sheet);
        return sheet;
    }

    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(FULL_HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, FULL_HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#FFD700");
    headerRange.setFontColor("#000000");

    return sheet;
}

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        // PDF TICKET RESCUE: kirim tiket via email (admin action)
        if (data.action === "sendTicket") {
            const result = handleSendTicket(data);
            return ContentService.createTextOutput(JSON.stringify(result))
                .setMimeType(ContentService.MimeType.JSON);
        }

        const sheet = getOrCreateDivisionSheet(data.divisionId);

        let uploadsFolder;
        const folders = DriveApp.getFoldersByName("ERIC_Registrations_Uploads");
        if (folders.hasNext()) {
            uploadsFolder = folders.next();
        } else {
            uploadsFolder = DriveApp.createFolder("ERIC_Registrations_Uploads");
        }

        function uploadBase64File(base64Data, filename) {
            if (!base64Data || !base64Data.startsWith("data:")) return "-";
            try {
                const parts = base64Data.split(",");
                const mimeMatch = parts[0].match(/:(.*?);/);
                const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
                const decoded = Utilities.base64Decode(parts[1]);
                const blob = Utilities.newBlob(decoded, mimeType, filename);
                const file = uploadsFolder.createFile(blob);
                file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
                return file.getUrl();
            } catch (err) {
                return "Upload Error: " + err.toString();
            }
        }

        const leaderIdUrl = uploadBase64File(data.leaderIdCardUrl, "LEADER_ID_" + data.teamName + "_" + (data.leaderIdCardName || "id_card"));
        const leaderTwibbonUrl = uploadBase64File(data.leaderTwibbonUrl, "LEADER_TWIBBON_" + data.teamName + "_" + (data.leaderTwibbonName || "twibbon"));
        const m1IdUrl = uploadBase64File(data.m1IdCardUrl, "MEMBER1_ID_" + data.teamName + "_" + (data.m1IdCardName || "id_card"));
        const m1TwibbonUrl = uploadBase64File(data.m1TwibbonUrl, "MEMBER1_TWIBBON_" + data.teamName + "_" + (data.m1TwibbonName || "twibbon"));
        const m2IdUrl = uploadBase64File(data.m2IdCardUrl, "MEMBER2_ID_" + data.teamName + "_" + (data.m2IdCardName || "id_card"));
        const m2TwibbonUrl = uploadBase64File(data.m2TwibbonUrl, "MEMBER2_TWIBBON_" + data.teamName + "_" + (data.m2TwibbonName || "twibbon"));
        const lecturerIdUrl = uploadBase64File(data.lecturerIdCardUrl, "LECTURER_ID_" + data.teamName + "_" + (data.lecturerIdCardName || "id_card"));
        const lecturerTwibbonUrl = uploadBase64File(data.lecturerTwibbonUrl, "LECTURER_TWIBBON_" + data.teamName + "_" + (data.lecturerTwibbonName || "twibbon"));
        const payProofUrl = uploadBase64File(data.paymentProofUrl, "PAY_PROOF_" + data.teamName + "_" + (data.paymentProofName || "proof"));

        const row = [
            data.id, new Date().toLocaleString(), data.divisionId, data.subCategory || "-", data.level || "-",
            data.teamName, data.leaderName, data.leaderEmail, data.leaderWhatsApp, data.leaderInstitution,
            data.leaderAddress || "-", data.leaderCongenitalDisease || "-", leaderIdUrl, leaderTwibbonUrl,
            data.m1Name || "-", data.m1WhatsApp || "-", data.m1CongenitalDisease || "-", m1IdUrl, m1TwibbonUrl,
            data.m2Name || "-", data.m2WhatsApp || "-", data.m2CongenitalDisease || "-", m2IdUrl, m2TwibbonUrl,
            data.lecturerName || "-", data.lecturerEmail || "-", data.lecturerWhatsApp || "-",
            data.lecturerCongenitalDisease || "-", lecturerIdUrl, lecturerTwibbonUrl,
            data.paymentMethod, data.paymentStatus, data.amount || "IDR 150,000", data.refCode, payProofUrl
        ];

        sheet.appendRow(row);

        // Force WhatsApp columns as plain text to prevent "Formula parse error"
        const lastRow = sheet.getLastRow();
        // 1-indexed columns: 9=LeaderWA, 16=Member1WA, 21=Member2WA, 27=LecturerWA
        [9, 16, 21, 27].forEach(col => {
            sheet.getRange(lastRow, col).setNumberFormat('@STRING@');
        });

        return ContentService.createTextOutput(JSON.stringify({ status: "success", id: data.id }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * PDF TICKET RESCUE — pastikan kolom log tiket ada di sheet.
 */
function ensureTicketLogColumns(sheet) {
    const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newCols = [
        ["Ticket Email Status", "#FFD700", "#000000"],
        ["Ticket Email Date", "#FFD700", "#000000"]
    ];
    newCols.forEach(function (def) {
        const name = def[0];
        if (!existingHeaders.includes(name)) {
            const col = existingHeaders.length + 1;
            sheet.getRange(1, col).setValue(name);
            sheet.getRange(1, col).setFontWeight("bold");
            sheet.getRange(1, col).setBackground(def[1]);
            sheet.getRange(1, col).setFontColor(def[2]);
            existingHeaders.push(name);
        }
    });
}

/**
 * PDF TICKET RESCUE — kirim PDF tiket ke email peserta via MailApp.
 * Dipanggil dari doPost dengan data.action === "sendTicket".
 */
function handleSendTicket(data) {
    const SECRET = "ERIC2026_TICKET_RESCUE";
    if (data.token !== SECRET) {
        return { status: "error", message: "Invalid admin token." };
    }
    if (!data.pdfBase64 || !data.toEmail) {
        return { status: "error", message: "Missing pdf attachment or recipient email." };
    }

    const parts = String(data.pdfBase64).split(",");
    if (parts.length < 2) {
        return { status: "error", message: "Invalid pdf base64 payload." };
    }

    const decoded = Utilities.base64Decode(parts[1]);
    const blob = Utilities.newBlob(decoded, "application/pdf", data.pdfName || "ERIC_2026_Ticket.pdf");

    MailApp.sendEmail({
        to: data.toEmail,
        subject: data.subject || "ERIC 2026 — Registration Ticket",
        body: data.body || "Terlampir tiket registrasi ERIC 2026.",
        attachments: [blob]
    });

    let logNote = "";
    try {
        const updated = updateTicketLog(data.refCode, "SENT", new Date().toLocaleString());
        if (updated === 0) logNote = " (ref code not found in sheets)";
    } catch (err) {
        logNote = " (log write error: " + err.toString() + ")";
    }

    return { status: "success", message: "Email sent to " + data.toEmail + logNote };
}

/**
 * PDF TICKET RESCUE — catat status pengiriman tiket ke kolom
 * "Ticket Email Status" & "Ticket Email Date" pada baris peserta (by Ref Code).
 */
function updateTicketLog(refCode, status, dateStr) {
    if (!refCode) return 0;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let updated = 0;
    const allSheets = ss.getSheets();

    for (let s = 0; s < allSheets.length; s++) {
        const sheet = allSheets[s];
        const sheetName = sheet.getName();
        if (!Object.values(DIVISION_MAP).includes(sheetName)) continue;
        if (sheet.getLastRow() <= 1) continue;

        ensureTicketLogColumns(sheet);
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const refCol = headers.indexOf("Ref Code") + 1;
        const statusCol = headers.indexOf("Ticket Email Status") + 1;
        const dateCol = headers.indexOf("Ticket Email Date") + 1;
        if (!refCol || !statusCol || !dateCol) continue;

        const data = sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
            if (String(data[i][refCol - 1]).trim() === String(refCode).trim()) {
                sheet.getRange(i + 1, statusCol).setValue(status);
                sheet.getRange(i + 1, dateCol).setValue(dateStr);
                updated++;
            }
        }
    }
    return updated;
}

/**
 * BANTUAN OTORISASI — jalankan SEKALI dari editor Apps Script:
 * dropdown fungsi di toolbar → pilih "authorizeMailApp" → klik Run →
 * pilih akun → Advanced → Go to project (unsafe) → Allow.
 * Diperlukan agar MailApp.sendEmail (scope script.send_mail) terotorisasi
 * untuk deployment Web App.
 */
function authorizeMailApp() {
    MailApp.sendEmail({
        to: Session.getActiveUser().getEmail(),
        subject: "ERIC 2026 — MailApp authorization test",
        body: "Jika Anda menerima email ini, MailApp sudah terotorisasi."
    });
    Logger.log("MailApp authorization OK — email test terkirim ke " + Session.getActiveUser().getEmail());
}

function doGet(e) {
    try {
        const action = e.parameter.action;
        const email = (e.parameter.email || '').toLowerCase().trim();
        const callback = e.parameter.callback;

        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const allSheets = ss.getSheets();

        // Debug helper: lihat SEMUA tab + jumlah baris + header asli (verifikasi mapping kolom).
        if (action === "debugHeaders") {
            const out = {};
            for (let s = 0; s < allSheets.length; s++) {
                const sh = allSheets[s];
                const info = { lastRow: sh.getLastRow(), lastColumn: sh.getLastColumn() };
                if (sh.getLastRow() >= 1 && sh.getLastColumn() >= 1) {
                    const hdrs = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
                    info.headers = hdrs.map(function (h) { return String(h); });
                }
                out[sh.getName()] = info;
            }
            const jh = JSON.stringify(out);
            if (callback) {
                return ContentService.createTextOutput(callback + '(' + jh + ')')
                    .setMimeType(ContentService.MimeType.JAVASCRIPT);
            }
            return ContentService.createTextOutput(jh)
                .setMimeType(ContentService.MimeType.JSON);
        }

        if (action === "getRegistrations") {
            const result = [];
            const seen = new Map(); // dedupe by id/refCode — tab "Copy of" bisa berisi baris sama

            for (let s = 0; s < allSheets.length; s++) {
                const sheet = allSheets[s];
                const sheetName = sheet.getName();
                // Baca SEMUA tab — nama tab bisa berbeda dari DIVISION_MAP
                // (data live ada di tab "ALL ERIC DATA"). Tab tanpa data dilewati.
                if (sheet.getLastRow() <= 1) continue;
                // Lewati duplikat/copy tab
                if (/^Copy of/i.test(sheetName)) continue;

                const data = sheet.getDataRange().getValues();
                const headers = data[0].map(h => String(h).trim());

                // --- Dynamic column mapping by header synonym ---
                // Sheet live memakai header non-standar (NAMA TIM, Column 1, dst),
                // jadi cari kolom lewat nama header yang mungkin dipakai.
                const col = (...names) => {
                    for (let i = 0; i < names.length; i++) {
                        const idx = headers.indexOf(names[i]);
                        if (idx >= 0) return idx;
                    }
                    return -1;
                };
                const val = (row, idx, def) => {
                    if (idx < 0) return def;
                    const v = row[idx];
                    return v !== undefined && v !== null ? String(v).trim() : def;
                };
                const mVal = (row, idx) => {
                    const v = val(row, idx, '');
                    return (v === '-' || v === '') ? '' : v;
                };
                const fallbackDivision = Object.keys(DIVISION_MAP)
                    .find(k => DIVISION_MAP[k].toLowerCase() === sheetName.toLowerCase()) || sheetName;

                const C = {
                    id: col('ID', 'Id', 'id'),
                    divisionId: col('Division', 'divisionId', 'DIVISI'),
                    subCategory: col('Sub Category', 'Sub Kategori', 'Subcategory', 'Sub', 'Kategori'),
                    level: col('Level', 'LEVEL'),
                    teamName: col('Team Name', 'NAMA TIM', 'Nama Tim', 'TIM', 'TEAM', 'Nama Team'),
                    leaderName: col('Leader Name', 'leaderName', 'Nama Leader', 'Nama Ketua', 'KETUA', 'Nama Ketua Tim'),
                    leaderEmail: col('Leader Email', 'leaderEmail', 'Email Leader', 'Email Ketua', 'EMAIL KETUA'),
                    leaderWhatsApp: col('Leader WhatsApp', 'leaderWhatsApp', 'WhatsApp Leader', 'WA Ketua', 'No. HP Ketua'),
                    leaderInstitution: col('Leader Institution', 'leaderInstitution', 'Institusi', 'Asal Sekolah', 'UNIVERSITAS', 'INSTITUSI'),
                    leaderAddress: col('Leader Address', 'leaderAddress', 'Alamat'),
                    leaderCongenitalDisease: col('Leader Congenital Disease', 'leaderCongenitalDisease', 'Penyakit Bawaan'),
                    leaderIdCardUrl: col('Leader ID Card', 'leaderIdCardUrl', 'ID Card Leader', 'KTP Leader'),
                    leaderTwibbonUrl: col('Leader Twibbon', 'leaderTwibbonUrl', 'Twibbon Leader'),
                    m1Name: col('Member 1 Name', 'm1Name', 'Anggota 1', 'Nama Anggota 1', 'ANGGOTA 1'),
                    m1WhatsApp: col('Member 1 WhatsApp', 'm1WhatsApp', 'WhatsApp Anggota 1', 'No. HP Anggota 1'),
                    m1CongenitalDisease: col('Member 1 Disease', 'm1CongenitalDisease', 'Penyakit Bawaan Anggota 1'),
                    m1IdCardUrl: col('Member 1 ID Card', 'm1IdCardUrl', 'ID Card Anggota 1'),
                    m1TwibbonUrl: col('Member 1 Twibbon', 'm1TwibbonUrl', 'Twibbon Anggota 1'),
                    m2Name: col('Member 2 Name', 'm2Name', 'Anggota 2', 'Nama Anggota 2', 'ANGGOTA 2'),
                    m2WhatsApp: col('Member 2 WhatsApp', 'm2WhatsApp', 'WhatsApp Anggota 2', 'No. HP Anggota 2'),
                    m2CongenitalDisease: col('Member 2 Disease', 'm2CongenitalDisease', 'Penyakit Bawaan Anggota 2'),
                    m2IdCardUrl: col('Member 2 ID Card', 'm2IdCardUrl', 'ID Card Anggota 2'),
                    m2TwibbonUrl: col('Member 2 Twibbon', 'm2TwibbonUrl', 'Twibbon Anggota 2'),
                    lecturerName: col('Lecturer Name', 'lecturerName', 'Nama Pembimbing', 'Pembimbing', 'DOSEN'),
                    lecturerEmail: col('Lecturer Email', 'lecturerEmail', 'Email Pembimbing'),
                    lecturerWhatsapp: col('Lecturer WhatsApp', 'lecturerWhatsapp', 'WhatsApp Pembimbing'),
                    lecturerCongenitalDisease: col('Lecturer Disease', 'lecturerCongenitalDisease', 'Penyakit Bawaan Pembimbing'),
                    lecturerIdCardUrl: col('Lecturer ID Card', 'lecturerIdCardUrl', 'ID Card Pembimbing'),
                    lecturerTwibbonUrl: col('Lecturer Twibbon', 'lecturerTwibbonUrl', 'Twibbon Pembimbing'),
                    paymentMethod: col('Payment Method', 'paymentMethod', 'Metode Pembayaran', 'Metode', 'Cara Bayar'),
                    paymentStatus: col('Payment Status', 'paymentStatus', 'Status Pembayaran', 'STATUS', 'Status'),
                    amount: col('Amount Paid', 'amount', 'Amount', 'Jumlah', 'Total', 'Nominal'),
                    refCode: col('Ref Code', 'refCode', 'REF', 'KODE REFERENSI', 'Kode Referensi'),
                    paymentProof: col('Payment Proof', 'paymentProofUrl', 'Bukti Bayar', 'BUKTI', 'Bukti Pembayaran'),
                    ticketStatus: col('Ticket Email Status', 'ticketEmailStatus', 'Status Email Tiket'),
                    ticketDate: col('Ticket Email Date', 'ticketEmailDate', 'Tanggal Email Tiket'),
                    ricStage1: col('ricStage1Status', 'RIC Stage 1 Status'),
                    ricStage2: col('ricStage2Status', 'RIC Stage 2 Status'),
                    ricStage3: col('ricStage3Status', 'RIC Stage 3 Status'),
                    ricAbstractUrl: col('ricAbstractUrl', 'Abstract URL'),
                    ricProposalUrl: col('ricProposalUrl', 'Proposal URL'),
                    ricVideoLink: col('ricVideoLink', 'Video Link'),
                    ricPosterUrl: col('ricPosterUrl', 'Poster URL'),
                    ricPptUrl: col('ricPptUrl', 'PPT URL')
                };

                for (let i = 1; i < data.length; i++) {
                    const row = data[i];
                    const leaderEmail = val(row, C.leaderEmail, '').toLowerCase();
                    if (!leaderEmail) continue;
                    if (email && !leaderEmail.includes(email)) continue;

                    // Normalisasi divisionId: nilai kolom "Division" bisa berisi
                    // sub-kategori (RC / Autonomous) alih-alih nama divisi penuh pada
                    // baris sumobot lama. Dalam kasus itu, pakai divisi asal tab
                    // (fallbackDivision dari nama sheet) supaya terhitung benar.
                    let divisionId = C.divisionId >= 0
                        ? val(row, C.divisionId, '')
                        : fallbackDivision;
                    if (!Object.prototype.hasOwnProperty.call(DIVISION_MAP, divisionId)) {
                        divisionId = fallbackDivision;
                    }
                    if (!Object.prototype.hasOwnProperty.call(DIVISION_MAP, divisionId)) {
                        divisionId = '';
                    }

                    // Output FLAT shape (kontrak flatToRegistration di frontend):
                    // leaderName, m1Name, ..., lecturerName, ..., ricStage*, ticketEmail*
                    const reg = {
                        id: val(row, C.id, ''),
                        divisionId: divisionId,
                        teamName: val(row, C.teamName, ''),
                        subCategory: mVal(row, C.subCategory),
                        level: mVal(row, C.level),
                        leaderName: val(row, C.leaderName, ''),
                        leaderEmail: leaderEmail,
                        leaderWhatsApp: val(row, C.leaderWhatsApp, ''),
                        leaderInstitution: val(row, C.leaderInstitution, ''),
                        leaderAddress: mVal(row, C.leaderAddress),
                        leaderCongenitalDisease: mVal(row, C.leaderCongenitalDisease),
                        leaderIdCardUrl: mVal(row, C.leaderIdCardUrl),
                        leaderTwibbonUrl: mVal(row, C.leaderTwibbonUrl),
                        m1Name: mVal(row, C.m1Name),
                        m1WhatsApp: mVal(row, C.m1WhatsApp),
                        m1CongenitalDisease: mVal(row, C.m1CongenitalDisease),
                        m1IdCardUrl: mVal(row, C.m1IdCardUrl),
                        m1TwibbonUrl: mVal(row, C.m1TwibbonUrl),
                        m2Name: mVal(row, C.m2Name),
                        m2WhatsApp: mVal(row, C.m2WhatsApp),
                        m2CongenitalDisease: mVal(row, C.m2CongenitalDisease),
                        m2IdCardUrl: mVal(row, C.m2IdCardUrl),
                        m2TwibbonUrl: mVal(row, C.m2TwibbonUrl),
                        lecturerName: mVal(row, C.lecturerName),
                        lecturerEmail: mVal(row, C.lecturerEmail),
                        lecturerWhatsapp: mVal(row, C.lecturerWhatsapp),
                        lecturerCongenitalDisease: mVal(row, C.lecturerCongenitalDisease),
                        lecturerIdCardUrl: mVal(row, C.lecturerIdCardUrl),
                        lecturerTwibbonUrl: mVal(row, C.lecturerTwibbonUrl),
                        paymentMethod: val(row, C.paymentMethod, ''),
                        paymentStatus: val(row, C.paymentStatus, ''),
                        amount: val(row, C.amount, ''),
                        refCode: val(row, C.refCode, ''),
                        paymentProofUrl: mVal(row, C.paymentProof),
                        ticketEmailStatus: mVal(row, C.ticketStatus),
                        ticketEmailDate: mVal(row, C.ticketDate),
                        ricStage1Status: mVal(row, C.ricStage1),
                        ricStage2Status: mVal(row, C.ricStage2),
                        ricStage3Status: mVal(row, C.ricStage3),
                        ricAbstractName: '',
                        ricAbstractUrl: mVal(row, C.ricAbstractUrl),
                        ricProposalName: '',
                        ricProposalUrl: mVal(row, C.ricProposalUrl),
                        ricVideoLink: mVal(row, C.ricVideoLink),
                        ricPosterName: '',
                        ricPosterUrl: mVal(row, C.ricPosterUrl),
                        ricPptName: '',
                        ricPptUrl: mVal(row, C.ricPptUrl)
                    };

                    const key = reg.id || reg.refCode || (leaderEmail + ':' + i);
                    if (seen.has(key)) continue;
                    seen.set(key, true);

                    result.push(reg);
                }
            }

            const json = JSON.stringify(result);
            if (callback) {
                return ContentService.createTextOutput(callback + '(' + json + ')')
                    .setMimeType(ContentService.MimeType.JAVASCRIPT);
            }
            return ContentService.createTextOutput(json)
                .setMimeType(ContentService.MimeType.JSON);
        }

        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: 'Use ?action=getRegistrations[&email=...] or ?action=debugHeaders' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * ONE-TIME MIGRATION: Backfill Payment Proof URLs for existing rows.
 * Sebelum fix, payProofUrl diupload ke Drive tapi tidak ditulis ke sheet.
 * Fungsi ini mencari file PAY_PROOF_{teamName} di folder Drive dan mengisi
 * URL-nya ke kolom Payment Proof yang kosong.
 * 
 * CARA PAKAI:
 * 1. Buka Apps Script editor (Extensions → Apps Script)
 * 2. Paste script terbaru, deploy
 * 3. Di editor, pilih fungsi "migratePaymentProofs" lalu klik Run
 */
function migratePaymentProofs() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const folders = DriveApp.getFoldersByName("ERIC_Registrations_Uploads");
    if (!folders.hasNext()) { Logger.log("Folder ERIC_Registrations_Uploads not found!"); return; }
    const uploadsFolder = folders.next();

    const sheetsToScan = [];
    const allSheets = ss.getSheets();
    for (let s = 0; s < allSheets.length; s++) {
        const sh = allSheets[s];
        const name = sh.getName();
        const isDiv = Object.values(DIVISION_MAP).includes(name);
        if (isDiv || name === "ALL ERIC DATA") {
            sheetsToScan.push(sh);
        }
    }

    let totalUpdated = 0;
    for (let si = 0; si < sheetsToScan.length; si++) {
        const sheet = sheetsToScan[si];
        const sheetName = sheet.getName();
        const rowCount = sheet.getLastRow();
        if (rowCount <= 1) { Logger.log("Sheet \"" + sheetName + "\": no data rows"); continue; }

        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        Logger.log("Sheet \"" + sheetName + "\": " + (rowCount - 1) + " data rows, headers: " + JSON.stringify(headers));

        // Find Payment Proof column
        let proofCol = headers.indexOf("Payment Proof") + 1;

        // Find Team Name column (ALL ERIC DATA might use index 5 with wrong header)
        let teamCol = headers.indexOf("Team Name") + 1;
        if (!teamCol && sheetName === "ALL ERIC DATA") {
            teamCol = 5 + 1; // Kolom index 5 kemungkinan berisi nama tim meski header "Level"
            Logger.log("Sheet \"" + sheetName + "\": using fallback teamCol=6 (header='" + headers[5] + "')");
        }

        if (!proofCol) {
            // Add "Payment Proof" column to sheets that don't have it yet
            proofCol = headers.length + 1;
            sheet.getRange(1, proofCol).setValue("Payment Proof");
            sheet.getRange(1, proofCol).setFontWeight("bold");
            sheet.getRange(1, proofCol).setBackground("#FFD700");
            sheet.getRange(1, proofCol).setFontColor("#000000");
            Logger.log("Sheet \"" + sheetName + "\": added Payment Proof column at " + proofCol);
        }

        if (!teamCol) {
            // Log first 2 data rows to help identify team name column
            if (rowCount > 1) {
                const sampleData = sheet.getRange(2, 1, Math.min(2, rowCount - 1), sheet.getLastColumn()).getValues();
                for (let r = 0; r < sampleData.length; r++) {
                    Logger.log("Sheet \"" + sheetName + "\" row " + (r + 2) + " sample: " + JSON.stringify(sampleData[r]));
                }
            }
            Logger.log("Sheet \"" + sheetName + "\": cannot determine team name column, skipping");
            continue;
        }

        // Log first data row to verify column mapping
        if (rowCount > 1) {
            const sampleRow = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
            Logger.log("Sheet \"" + sheetName + "\" first row: teamCol=" + teamCol + " value=[" + sampleRow[teamCol - 1] + "], proofCol=" + proofCol + " value=[" + sampleRow[proofCol - 1] + "]");
        }

        // Pre-index all PAY_PROOF files by team name for faster matching
        const fileMap = {};
        const iter = uploadsFolder.getFiles();
        while (iter.hasNext()) {
            const f = iter.next();
            const fname = f.getName();
            if (fname.startsWith("PAY_PROOF_")) {
                // Try first team name segment (before first underscore after prefix)
                const afterPrefix = fname.substring(10); // Remove "PAY_PROOF_"
                // Team name could contain spaces, and original filename after last space-segment
                // Use the actual team names from the sheet as keys
                fileMap[f.getUrl()] = fname.toUpperCase();
            }
        }

        const data = sheet.getDataRange().getValues();
        let updated = 0;
        for (let i = 1; i < data.length; i++) {
            const existingProof = String(data[i][proofCol - 1] || '').trim();
            if (existingProof && existingProof !== '-' && existingProof.startsWith('http')) continue;

            const teamName = String(data[i][teamCol - 1] || '').trim().toUpperCase();
            if (!teamName || teamName === '-' || teamName.length < 2) continue;

            // Search for matching file
            let matchedUrl = null;
            const iter2 = uploadsFolder.getFiles();
            while (iter2.hasNext()) {
                const file = iter2.next();
                const fname = file.getName().toUpperCase();
                if (fname.startsWith("PAY_PROOF_" + teamName + "_") || fname === "PAY_PROOF_" + teamName) {
                    matchedUrl = file.getUrl();
                    break;
                }
            }

            if (matchedUrl) {
                sheet.getRange(i + 1, proofCol).setValue(matchedUrl);
                updated++;
                totalUpdated++;
            }
        }
        Logger.log("Sheet \"" + sheetName + "\": " + updated + " rows updated");
    }
    Logger.log("Migration complete! Total: " + totalUpdated + " rows updated");
}

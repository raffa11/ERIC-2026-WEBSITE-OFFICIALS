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
 * - doGet: read registrations back from sheets (action=getRegistrations&email=...)
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

  let sheet = ss.getSheetByName(sheetName);
  if (sheet) return sheet;

  sheet = ss.insertSheet(sheetName);

  const headers = [
    "ID", "Timestamp", "Division", "Sub Category", "Level", "Team Name",
    "Leader Name", "Leader Email", "Leader WhatsApp", "Leader Institution", "Leader Address", "Leader Congenital Disease",
    "Leader ID Card", "Leader Twibbon",
    "Member 1 Name", "Member 1 WhatsApp", "Member 1 Disease", "Member 1 ID Card", "Member 1 Twibbon",
    "Member 2 Name", "Member 2 WhatsApp", "Member 2 Disease", "Member 2 ID Card", "Member 2 Twibbon",
    "Lecturer Name", "Lecturer Email", "Lecturer WhatsApp", "Lecturer Disease", "Lecturer ID Card", "Lecturer Twibbon",
    "Payment Method", "Payment Status", "Amount Paid", "Ref Code"
  ];

  sheet.appendRow(headers);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#FFD700");
  headerRange.setFontColor("#000000");

  return sheet;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
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
      data.paymentMethod, data.paymentStatus, data.amount || "IDR 150,000", data.refCode
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

function doGet(e) {
  try {
    const action = e.parameter.action;
    const email = (e.parameter.email || '').toLowerCase().trim();
    const callback = e.parameter.callback;

    if (action === "getRegistrations" && email) {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const allSheets = ss.getSheets();
      const result = [];

      // Standard headers expected in each division sheet
      const headers = [
        "ID", "Timestamp", "Division", "Sub Category", "Level", "Team Name",
        "Leader Name", "Leader Email", "Leader WhatsApp", "Leader Institution", "Leader Address", "Leader Congenital Disease",
        "Leader ID Card", "Leader Twibbon",
        "Member 1 Name", "Member 1 WhatsApp", "Member 1 Disease", "Member 1 ID Card", "Member 1 Twibbon",
        "Member 2 Name", "Member 2 WhatsApp", "Member 2 Disease", "Member 2 ID Card", "Member 2 Twibbon",
        "Lecturer Name", "Lecturer Email", "Lecturer WhatsApp", "Lecturer Disease", "Lecturer ID Card", "Lecturer Twibbon",
        "Payment Method", "Payment Status", "Amount Paid", "Ref Code"
      ];

      function col(name) { return headers.indexOf(name); }

      for (let s = 0; s < allSheets.length; s++) {
        const sheet = allSheets[s];
        const sheetName = sheet.getName();
        // Skip non-division sheets (like the auto-generated "Sheet1")
        const isDivision = Object.values(DIVISION_MAP).includes(sheetName);
        if (!isDivision) continue;
        if (sheet.getLastRow() <= 1) continue;

        const data = sheet.getDataRange().getValues();

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const leaderEmail = String(row[col("Leader Email")] || '').toLowerCase().trim();

          if (!leaderEmail || !leaderEmail.includes(email)) continue;

          function val(idx) {
            const v = row[idx];
            return v !== undefined && v !== null ? String(v) : '';
          }

          function mVal(idx) {
            const v = val(idx);
            return v === '-' ? '' : v;
          }

          // Reconstruct Registration object
          const reg = {
            id: val(col("ID")),
            divisionId: val(col("Division")),
            teamName: val(col("Team Name")),
            subCategory: mVal(col("Sub Category")),
            level: mVal(col("Level")),
            leader: {
              name: val(col("Leader Name")),
              email: val(col("Leader Email")),
              whatsapp: val(col("Leader WhatsApp")),
              institution: val(col("Leader Institution")),
              address: mVal(col("Leader Address")),
              congenitalDisease: mVal(col("Leader Congenital Disease")),
              idCardUrl: mVal(col("Leader ID Card")),
              twibbonUrl: mVal(col("Leader Twibbon"))
            },
            members: [],
            paymentMethod: val(col("Payment Method")),
            paymentStatus: val(col("Payment Status")),
            refCode: val(col("Ref Code")),
            amount: val(col("Amount Paid")),
            lecturerName: mVal(col("Lecturer Name")),
            lecturerEmail: mVal(col("Lecturer Email")),
            lecturerWhatsapp: mVal(col("Lecturer WhatsApp")),
            lecturerCongenitalDisease: mVal(col("Lecturer Disease")),
            lecturerIdCardUrl: mVal(col("Lecturer ID Card")),
            lecturerTwibbonUrl: mVal(col("Lecturer Twibbon"))
          };

          // Reconstruct members
          const m1Name = mVal(col("Member 1 Name"));
          if (m1Name) {
            reg.members.push({
              id: 'member-1',
              name: m1Name,
              whatsapp: mVal(col("Member 1 WhatsApp")),
              congenitalDisease: mVal(col("Member 1 Disease")),
              idCardUrl: mVal(col("Member 1 ID Card")),
              twibbonUrl: mVal(col("Member 1 Twibbon"))
            });
          }
          const m2Name = mVal(col("Member 2 Name"));
          if (m2Name) {
            reg.members.push({
              id: 'member-2',
              name: m2Name,
              whatsapp: mVal(col("Member 2 WhatsApp")),
              congenitalDisease: mVal(col("Member 2 Disease")),
              idCardUrl: mVal(col("Member 2 ID Card")),
              twibbonUrl: mVal(col("Member 2 Twibbon"))
            });
          }

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

    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: 'Use ?action=getRegistrations&email=...' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

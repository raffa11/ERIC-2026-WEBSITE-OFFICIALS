/**
 * GOOGLE APPS SCRIPT FOR GOOGLE SHEET SYNCHRONIZATION
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/12ouLbtyguh2VWYX0_DQlJUU_KCCEZ4qQBtH0RL2UFP8/edit
 * 2. In the top menu, go to "Extensions" -> "Apps Script"
 * 3. Delete any default code in Code.gs and paste this entire script.
 * 4. In the script below, make sure the spreadsheet ID matches yours (it's already configured below).
 * 5. Click "Deploy" -> "New deployment"
 * 6. Under "Select type" (gear icon), choose "Web app"
 * 7. Set "Who has access" to "Anyone"
 * 8. Click "Deploy", authorize permissions.
 * 9. Copy the Web App URL and paste it in Admin Dashboard.
 * 
 * OPTIMIZATION: Each competition division gets its own sheet tab.
 * Data is automatically routed to the correct tab based on divisionId.
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
  headerRange.setBackground("#00FF88");
  headerRange.setFontColor("#000000");

  return sheet;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateDivisionSheet(data.divisionId);

    // Get or create a folder in Google Drive to store file uploads
    let uploadsFolder;
    const folders = DriveApp.getFoldersByName("ERIC_Registrations_Uploads");
    if (folders.hasNext()) {
      uploadsFolder = folders.next();
    } else {
      uploadsFolder = DriveApp.createFolder("ERIC_Registrations_Uploads");
    }

    // Helper function to decode and save Base64 file string to Google Drive
    function uploadBase64File(base64Data, filename) {
      if (!base64Data || !base64Data.startsWith("data:")) {
        return "-";
      }
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

    // Decode and upload files
    const leaderIdUrl = uploadBase64File(data.leaderIdCardUrl, "LEADER_ID_" + data.teamName + "_" + (data.leaderIdCardName || "id_card"));
    const leaderTwibbonUrl = uploadBase64File(data.leaderTwibbonUrl, "LEADER_TWIBBON_" + data.teamName + "_" + (data.leaderTwibbonName || "twibbon"));

    const m1IdUrl = uploadBase64File(data.m1IdCardUrl, "MEMBER1_ID_" + data.teamName + "_" + (data.m1IdCardName || "id_card"));
    const m1TwibbonUrl = uploadBase64File(data.m1TwibbonUrl, "MEMBER1_TWIBBON_" + data.teamName + "_" + (data.m1TwibbonName || "twibbon"));

    const m2IdUrl = uploadBase64File(data.m2IdCardUrl, "MEMBER2_ID_" + data.teamName + "_" + (data.m2IdCardName || "id_card"));
    const m2TwibbonUrl = uploadBase64File(data.m2TwibbonUrl, "MEMBER2_TWIBBON_" + data.teamName + "_" + (data.m2TwibbonName || "twibbon"));

    const lecturerIdUrl = uploadBase64File(data.lecturerIdCardUrl, "LECTURER_ID_" + data.teamName + "_" + (data.lecturerIdCardName || "id_card"));
    const lecturerTwibbonUrl = uploadBase64File(data.lecturerTwibbonUrl, "LECTURER_TWIBBON_" + data.teamName + "_" + (data.lecturerTwibbonName || "twibbon"));

    const payProofUrl = uploadBase64File(data.paymentProofUrl, "PAY_PROOF_" + data.teamName + "_" + (data.paymentProofName || "proof"));

    // Build row
    const row = [
      data.id,
      new Date().toLocaleString(),
      data.divisionId,
      data.subCategory || "-",
      data.level || "-",
      data.teamName,
      data.leaderName,
      data.leaderEmail,
      data.leaderWhatsApp,
      data.leaderInstitution,
      data.leaderAddress || "-",
      data.leaderCongenitalDisease || "-",
      leaderIdUrl,
      leaderTwibbonUrl,
      data.m1Name || "-",
      data.m1WhatsApp || "-",
      data.m1CongenitalDisease || "-",
      m1IdUrl,
      m1TwibbonUrl,
      data.m2Name || "-",
      data.m2WhatsApp || "-",
      data.m2CongenitalDisease || "-",
      m2IdUrl,
      m2TwibbonUrl,
      data.lecturerName || "-",
      data.lecturerEmail || "-",
      data.lecturerWhatsApp || "-",
      data.lecturerCongenitalDisease || "-",
      lecturerIdUrl,
      lecturerTwibbonUrl,
      data.paymentMethod,
      data.paymentStatus,
      data.amount || "IDR 150,000",
      data.refCode
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", id: data.id }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

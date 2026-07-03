/**
 * GOOGLE APPS SCRIPT FOR GOOGLE SHEET SYNCHRONIZATION
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/12ouLbtyguh2VWYX0_DQlJUU_KCCEZ4qQBtH0RL2UFP8/edit
 * 2. In the top menu, go to "Extensions" -> "Apps Script"
 * 3. Delete any default code in Code.gs and paste this entire script.
 * 4. In the script below, make sure the spreadsheet ID matches yours (it's already configured below).
 * 5. In the top right, click "Deploy" -> "New deployment"
 * 6. Under "Select type" (gear icon), choose "Web app"
 * 7. Change "Who has access" to "Anyone" (this is CRITICAL so the web app can receive registrations without login).
 * 8. Click "Deploy", authorize the permissions for Google Drive & Google Sheets.
 * 9. Copy the generated Web App URL (ends with /exec).
 * 10. Open your ERIC Admin Dashboard, find the "Google Sheet Synchronization" card, paste the URL there, and click Save.
 * 
 * DONE! All registrations will now instantly synchronize to your Google Sheet, and uploaded files 
 * (ID cards, twibbons, payment proofs) will be automatically decoded, saved to your Google Drive, 
 * and linked cleanly in the spreadsheet.
 */

const SPREADSHEET_ID = "12ouLbtyguh2VWYX0_DQlJUU_KCCEZ4qQBtH0RL2UFP8";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getActiveSheet();
    
    // 1. Get or create a folder in your Google Drive to store file uploads
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
        
        // Enable anyone with link to view so the admin can open them easily
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        return file.getUrl();
      } catch (err) {
        return "Upload Error: " + err.toString();
      }
    }
    
    // 2. Decode and upload files
    const leaderIdUrl = uploadBase64File(data.leaderIdCardUrl, "LEADER_ID_" + data.teamName + "_" + (data.leaderIdCardName || "id_card"));
    const leaderTwibbonUrl = uploadBase64File(data.leaderTwibbonUrl, "LEADER_TWIBBON_" + data.teamName + "_" + (data.leaderTwibbonName || "twibbon"));
    
    const m1IdUrl = uploadBase64File(data.m1IdCardUrl, "MEMBER1_ID_" + data.teamName + "_" + (data.m1IdCardName || "id_card"));
    const m1TwibbonUrl = uploadBase64File(data.m1TwibbonUrl, "MEMBER1_TWIBBON_" + data.teamName + "_" + (data.m1TwibbonName || "twibbon"));
    
    const m2IdUrl = uploadBase64File(data.m2IdCardUrl, "MEMBER2_ID_" + data.teamName + "_" + (data.m2IdCardName || "id_card"));
    const m2TwibbonUrl = uploadBase64File(data.m2TwibbonUrl, "MEMBER2_TWIBBON_" + data.teamName + "_" + (data.m2TwibbonName || "twibbon"));
    
    const lecturerIdUrl = uploadBase64File(data.lecturerIdCardUrl, "LECTURER_ID_" + data.teamName + "_" + (data.lecturerIdCardName || "id_card"));
    const lecturerTwibbonUrl = uploadBase64File(data.lecturerTwibbonUrl, "LECTURER_TWIBBON_" + data.teamName + "_" + (data.lecturerTwibbonName || "twibbon"));
    
    const payProofUrl = uploadBase64File(data.paymentProofUrl, "PAY_PROOF_" + data.teamName + "_" + (data.paymentProofName || "proof"));
    
    // 3. Define headers
    const headers = [
      "ID", 
      "Timestamp", 
      "Division", 
      "Sub Category", 
      "Level", 
      "Team Name",
      "Leader Name", 
      "Leader Email", 
      "Leader WhatsApp", 
      "Leader Institution", 
      "Leader Address", 
      "Leader Congenital Disease",
      "Leader ID Card", 
      "Leader Twibbon",
      "Member 1 Name", 
      "Member 1 WhatsApp", 
      "Member 1 Disease", 
      "Member 1 ID Card", 
      "Member 1 Twibbon",
      "Member 2 Name", 
      "Member 2 WhatsApp", 
      "Member 2 Disease", 
      "Member 2 ID Card", 
      "Member 2 Twibbon",
      "Lecturer Name", 
      "Lecturer Email", 
      "Lecturer WhatsApp", 
      "Lecturer Disease", 
      "Lecturer ID Card", 
      "Lecturer Twibbon",
      "Payment Method", 
      "Payment Status", 
      "Amount Paid", 
      "Ref Code",
      "Check In Time"
    ];
    
    // Setup headers if the sheet is completely empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#00FF88");
      headerRange.setFontColor("#000000");
    }
    
    // 4. Populate row data
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
      data.refCode,
      ""
    ];
    
    sheet.appendRow(row);
    
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
    const refCode = e.parameter.refCode;

    if (action === "checkin" && refCode) {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = ss.getActiveSheet();
      const data = sheet.getDataRange().getValues();
      const headers = data[0];

      const refCodeCol = headers.indexOf("Ref Code") + 1;
      const checkInCol = headers.indexOf("Check In Time") + 1;
      const paymentStatusCol = headers.indexOf("Payment Status") + 1;

      if (refCodeCol === 0 || checkInCol === 0 || paymentStatusCol === 0) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Required columns not found" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      let foundRow = -1;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][refCodeCol - 1]).toUpperCase() === refCode.toUpperCase()) {
          foundRow = i + 1;
          break;
        }
      }

      if (foundRow === -1) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Ref code not found" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const currentStatus = sheet.getRange(foundRow, paymentStatusCol).getValue();
      if (currentStatus === "CHECKED IN") {
        return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Already checked in", alreadyCheckedIn: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const now = new Date();
      sheet.getRange(foundRow, paymentStatusCol).setValue("CHECKED IN");
      sheet.getRange(foundRow, checkInCol).setValue(now.toLocaleString());

      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Checked in successfully" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: 'Invalid action. Use ?action=checkin&refCode=...' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

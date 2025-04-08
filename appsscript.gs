function doPost(e) {
  const inviteSheetId = '你的邀請碼清單 Sheet ID';
  const dataSheetId = '你的店家資料 Sheet ID';
  const inviteSheetName = '邀請碼清單';
  const dataSheetName = '店家資料';

  const data = JSON.parse(e.postData.contents);
  const code = data.code;
  const timestamp = new Date();

  const inviteSheet = SpreadsheetApp.openById(inviteSheetId).getSheetByName(inviteSheetName);
  const inviteData = inviteSheet.getDataRange().getValues();
  const codeIndex = inviteData[0].indexOf('邀請碼');
  const statusIndex = inviteData[0].indexOf('狀態');
  const timeIndex = inviteData[0].indexOf('使用時間');

  let valid = false;

  for (let i = 1; i < inviteData.length; i++) {
    if (inviteData[i][codeIndex] === code) {
      if (inviteData[i][statusIndex] === '未使用') {
        // 標記為已使用
        inviteSheet.getRange(i + 1, statusIndex + 1).setValue('已使用');
        inviteSheet.getRange(i + 1, timeIndex + 1).setValue(timestamp);
        valid = true;
        break;
      } else {
        return ContentService.createTextOutput(JSON.stringify({ success: false, reason: 'used' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
  }

  if (!valid) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, reason: 'notfound' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const dataSheet = SpreadsheetApp.openById(dataSheetId).getSheetByName(dataSheetName);

  const newRow = [
    data.name,
    data.address,
    data.latlng,
    data.type,
    data.tags,
    data.desc,
    data.hours,
    data.ig,
    data.line,
    data.photo,
    timestamp
  ];

  dataSheet.appendRow(newRow);

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

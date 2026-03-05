/**
 * DEPLOY INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Open your existing project (the one with the current doPost)
 * 3. Replace ALL the code with this file's contents
 * 4. Click Deploy > Manage deployments
 * 5. Click the pencil icon on the existing deployment
 * 6. Set Version to "New version"
 * 7. Click Deploy
 *
 * This script handles: email sending, CC, replyTo, and file attachments
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var options = {
      htmlBody: data.html,
    };

    if (data.replyTo) options.replyTo = data.replyTo;
    if (data.cc) options.cc = data.cc;

    // Convert base64 attachments to proper email attachments
    if (data.attachments && data.attachments.length > 0) {
      options.attachments = data.attachments.map(function (att) {
        return Utilities.newBlob(
          Utilities.base64Decode(att.data),
          att.mimeType,
          att.filename
        );
      });
    }

    GmailApp.sendEmail(data.to, data.subject, '', options);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

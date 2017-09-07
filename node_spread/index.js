var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var async = require('async');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

var usr = "test";

function test(callback) {
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    let kq = JSON.parse(content);
    callback(null, kq);
    //authorize(JSON.parse(content),listData);
  });
}

function test2(kq, callback) {
  var clientSecret = kq.installed.client_secret;
  var clientId = kq.installed.client_id;
  var redirectUrl = kq.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(null, oauth2Client);
    }
  });
}

async.waterfall([
  test,
  test2
  // myLastFunction,
], function (err, result) {
  listData(result);
});

function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function (code) {
    rl.close();
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function thongBao(tb) {
  return console.log(tb);
}

function listData(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: '1L2Id1K9l9_Rvatxq83TWlLXZEtp2stCLjCqNQYwNQ7A',
    range: 'test1!A2:C',
  }, function (err, response) {
    if (err) {
      console.log('API xảy ra lỗi: ' + err);
      return;
    }
    var rows = response.values;
    if (rows.length == 0) {
      console.log('Không có dữ liệu');
    } else {
      console.log(response.values);
      //console.log("Ok");
      //fs.writeFile('./fileJson/' + usr + '.json', '');
      //fs.writeFile('./fileJson/' + usr + '.json', JSON.stringify(rows));
      //var id = "ma_1";
      // for (var i = 0; i < rows.length; i++) {
      //   var r = rows[i];
      //   if (r[0] == id.toUpperCase().trim()) {
      //     if (r[2] > 1) {
      //       thongBao("Hàng còn");
      //     } else {
      //       thongBao("Hết hàng");
      //     }
      //   }
      // }
    }
  });
}
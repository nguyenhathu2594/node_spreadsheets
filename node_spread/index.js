var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var async = require('async');
var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var router = express();

//Khởi tạo
var app = express();
var port = process.env.PORT || 3000; //Cấu hình theo biến môi trường(Nếu port k có sẽ gán mặc định cổng 3000)
app.use(bodyParser.json()); //Dữ liệu muốn đọc từ người dùng là Json
app.use(bodyParser.urlencoded({
  extended: true
})); //Chấp nhận các kiểu dữ liệu post về server
app.use(logger("dev")); //Log
app.get('/', (req, res) => {
  res.send("Server chạy Ok");
});
var server = http.createServer(app);
//Khởi động server
// app.listen(port, function () {
//   console.log("Ứng dụng đang chạy trên cổng: " + port);
// })

var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

function GetSecret(callback) {
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

function GetOauth(kq, callback) {
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
//Trả về đối tượng sau khi đã lấy được xác thực(Chạy đồng bộ không bất đồng bộ nếu không sẽ không trả về key xác thực)


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

function listData(auth, id) {
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
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (r[0].toUpperCase().trim() == id.toUpperCase().trim()) {
          if (r[2] > 1) {
            return thongBao("Hàng còn");
          } else {
            return thongBao("Hết hàng");
          }
        } else {
          return thongBao(`Không tồn tại mặt hàng có mã là: ${id.toUpperCase().trim()}`);
        }
      }
    }
  });
}

app.get('/getsl/:id', function (req, res) {
  if (req.params.id != null) {
    async.waterfall([
      GetSecret,
      GetOauth
    ], function (err, result) {
      res.json(listData(result, req.params.id));
    });
  }
});

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3002);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "127.0.0.1");

server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
});
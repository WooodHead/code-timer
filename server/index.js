const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const simpleOauthModule = require('simple-oauth2');
const passwords = require('../passwords.js');

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

app.use(express.static(__dirname + '/../client/dist'));

var token;
var durations;

const oauth2 = simpleOauthModule.create({
  client: {
    id: passwords.WAKATIME_CLIENT_ID,
    secret: passwords.WAKATIME_CLIENT_SECRET
  },
  auth: {
    tokenHost: 'https://wakatime.com/api/v1/',
    tokenPath: 'https://wakatime.com/oauth/token',
    authorizePath: 'https://wakatime.com/oauth/authorize',
  },
});

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'http://localhost:8080/callback',
  response_type: 'code',
  scope: 'email,read_logged_time, read_stats'
});

// Initial page redirecting to WakaTime
app.get('/auth', (req, res) => {
  res.redirect(authorizationUri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', (req, res) => {
  const code = req.query.code;
  const headers = {
    'Accept': 'application/x-www-form-urlencoded'
  }
  oauth2.authorizationCode.getToken({
    headers: headers,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: 'http://localhost:8080/callback'
  }, (error, result) => {
    if (error) {
      //console.error('Access Token Error', error.message);
      return res.json('Authentication failed');
    }

    //console.log('The resulting token: ', result);
    token = oauth2.accessToken.create(result);
    request({
      url: 'https://wakatime.com/api/v1/users/current/durations?date=2018-02-22',
      auth: {
        'bearer': token.token.access_token
      }
    }, function(err, res) {
      if(err){
        console.log(err);
      }
      durations = res.body;
      return res.status(200).json(durations);
    });

    return res.status(200).json(durations);
  });
});

app.get('/success', (req, res) => {
  res.send('');
});

// app.get('/', (req, res) => {
//   res.send('Hello<br><a href="/auth">Log in with WakaTime</a>');
// });

app.listen(port, () => {
  console.log(`Express server started on port: ${port}`); // eslint-disable-line
});

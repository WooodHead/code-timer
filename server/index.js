const express = require('express');
const simpleOauthModule = require('simple-oauth2');
const passwords = require('../passwords.js');

const app = express();

app.use(express.static(__dirname + '/../client/dist'));

const oauth2 = simpleOauthModule.create({
  client: {
    id: passwords.WAKATIME_CLIENT_ID,
    secret: passwords.WAKATIME_CLIENT_SECRET
  },
  auth: {
    tokenHost: 'https://wakatime.com',
    tokenPath: '/oauth/token',
    authorizePath: '/oauth/authorize',
  },
});

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'http://localhost:8080/callback',
  response_type: 'code',
  scope: 'email,read_logged_time'
});

// Initial page redirecting to WakaTime
app.get('/auth', (req, res) => {
  res.redirect(authorizationUri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', (req, res) => {
  const code = req.query.code;
  console.log(code);
  const options = {
    code,
  };

  oauth2.authorizationCode.getToken(options, (error, result) => {
    if (error) {
      console.error('Access Token Error', error.message);
      return res.json('Authentication failed');
    }

    console.log('The resulting token: ', result);
    const token = oauth2.accessToken.create(result);

    return res.status(200).json(token);
  });
});

app.get('/success', (req, res) => {
  res.send('');
});

// app.get('/', (req, res) => {
//   res.send('Hello<br><a href="/auth">Log in with WakaTime</a>');
// });

app.listen(8080, () => {
  console.log('Express server started on port 8080'); // eslint-disable-line
});

const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const axios = require('axios');

const simpleOauthModule = require('simple-oauth2');

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

app.use(express.static(__dirname + '/../client/dist'));

var token;
var durations;

const oauth2 = simpleOauthModule.create({
  client: {
    id: process.env.WAKATIME_CLIENT_ID,
    secret: process.env.WAKATIME_CLIENT_SECRET
  },
  auth: {
    tokenHost: 'https://wakatime.com/api/v1/',
    tokenPath: 'https://wakatime.com/oauth/token',
    authorizePath: 'https://wakatime.com/oauth/authorize',
  },
});

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'https://codetimer.herokuapp.com/callback',
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
    redirect_uri: 'https://codetimer.herokuapp.com/callback'
  }, (error, result) => {
    if (error) {
      return res.json('Authentication failed');
    }

    //console.log('The resulting token: ', result);
    token = oauth2.accessToken.create(result);
    const dt = new Date();
    const rightDt = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();

    axios({
      method: "get",
      url: `https://wakatime.com/api/v1/users/current/durations?date=${rightDt}`,
      auth: {
        bearer: token.token.access_token
      }})
      .then((response) => durations = response.body)
      .catch((error) => console.log(error))

    res.status(200).json(durations);
    //TO-DO
    //change callback for testing purposes
    //return something to the homapage
    //how to create routing for authorized users in the front-end
    //promisify/replace request with axios
    //add request to commits endpoint of wakatime
    //figure out facebook dot
    //set up cron job to send daily message through facebook
    //clean up code
    //figure out heroku hosting

  });
});

app.get('/success', (req, res) => {
  res.send('');
});

// app.get('/', (req, res) => {
//   res.send('Hello<br><a href="/auth">Log in with WakaTime</a>');
// });

app.listen(port, () => {
  console.log(`Express server started on port: ${port}`);
});

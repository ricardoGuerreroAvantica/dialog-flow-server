const express = require('express');
const bodyParser = require('body-parser');
const app = express();

var authHelper = require('./authHelper');

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());



app.post("/action", (req, res) => {
  var action =
    req.body.result &&
    req.body.result.action
      ? req.body.result.action
      : "Seems like some problem. Speak again.";

  switch (action) {
    case 'login':
      var username = req.body.result.parameters.username;
      var password = req.body.result.parameters.password;
      var token = authHelper.getTokenFromCode(username, password, (result) => {
        return res.json({
          speech: token,
          displayText: token,
          source: "dialog-flow-server"
        });
      });
      break;
    default:

  }

});

app.listen(process.env.PORT || 8000, () => {
  console.log("Server up and listening");
})

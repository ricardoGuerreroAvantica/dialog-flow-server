const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8000;

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);


app.post("/check", function(req, res) {
  return res.json({
    speech:
      '<speak>  check </speak>',
    displayText:
      '<speak>  check </speak>',
    source: "dialog-flow-server"
  });
});


app.get("/echo", function(req, res) {
  return res.json({
    hi:
      '<hi>  hi </hi>'
  });
});


app.use(bodyParser.json());

app.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});

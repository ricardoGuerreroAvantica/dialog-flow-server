const express = require('express');
const app = express();
const port = 8000;

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);


restService.post("/check", function(req, res) {
  return res.json({
    speech:
      '<speak>  check </speak>',
    displayText:
      '<speak>  check </speak>',
    source: "dialog-flow-server"
  });
});


app.use(bodyParser.json());

restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});

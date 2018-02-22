const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8000;

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);


app.post("/action", function(req, res) {

  console.log(req.body.result);

  return res.json({
    speech:
      '<speak>  '+ req.body.result +' </speak>',
    displayText:
      '<speak>  '+ req.body.result +' </speak>',
    source: "dialog-flow-server"
  });
});



app.use(bodyParser.json());

app.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});

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
  JSON.stringify(req.body);

  return res.json({
    speech:
      '<speak>  '+ JSON.stringify(req.body) +' </speak>',
    displayText:
      '<speak>  '+ JSON.stringify(req.body) +' </speak>',
    source: "dialog-flow-server"
  });
});

app.get("/check", function(req, res) {
  var obj = { "name":"John", "age":function () {return 30;}, "city":"New York"};
  console.log(JSON.stringify(obj));
  console.log(obj);
  return res.json({
    speech: obj
  });
});

app.use(bodyParser.json());

app.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});

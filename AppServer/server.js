const express = require('express');
let serveStatic = require('serve-static');

let app = express();
app.use(function(req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(serveStatic('./dist/'));
app.listen(9000);
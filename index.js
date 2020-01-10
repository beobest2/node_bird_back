const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.set('Hello Server');
});

app.listen(8080, () => {
  console.log(`server is running on http://localhost:8080`);
});
const express = require('express');
const path = require('path');
const fs = require('fs'); 

const dataFile = path.join(__dirname + '/data.json');
const app = express(); 

let PORT = process.env.PORT || 3000; 
let ENV = process.env.NODE_ENV;
console.log(ENV);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

// create a new mini URL
app.get('/route?', (req, res) => {
  const url = req.query.url; 
  const regex = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/;

  if (!url.match(regex)) {
    res.status(400).json({error: 'invalid url'});
  } 
  
  else {
    fs.readFile(dataFile, (err, data) => {
      if (err) handleError(500);
        
      const dataObject = JSON.parse(data.toString('utf8'));
      let { count, urls } = dataObject; 

      const shortUrl = (ENV === 'development') ?
         `http://${req.hostname}:${port}/mini/${count++}`:
         `https://arwl-minurl.herokuapp.com/mini/${count++}`;
        
      const newRecord = { 
        originalUrl: url, 
        shortUrl: shortUrl
      };
      urls.push(newRecord);  
      dataObject.count = count;
    
      fs.writeFile(dataFile, JSON.stringify(dataObject), (err) => {
        if (err) handleError(500);
        res.status(200).json({shortUrl: shortUrl});
        res.end();
      });
    });
  }
});

// redirect an existing mini URL
app.get('/mini/:count', (req, res) => {
  const count = req.params.count; 
  if (!count.match(/[0-9]+/g)) {
    res.status(404).send({error: 'URL not found'});
  }
  fs.readFile(dataFile, (err, data) => {
    if (err) handleError(500);
      
    const dataObject = JSON.parse(data.toString('utf8'));
    const record = getRecord(count, dataObject);
    if (!record) {
      res.status(404).json({error: 'URL does not exist'});
    } else {
      res.redirect(301, record.originalUrl);
    }
  });
});

function getRecord(count, dataObject) {
  const recordFound = dataObject.urls[count]; 
  return recordFound || null;
}

function handleError(statusCode) {
 switch (statusCode) {
   case 500: 
    res.status(500).send({error: 'The server could not handle your request'});
 }
}

app.listen(PORT, () => {
  console.log(`Listening on Port: ${PORT}`);
})
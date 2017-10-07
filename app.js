const express = require('express');
const path = require('path');
const fs = require('fs'); 

const dataFile = path.join(__dirname + '/data.json');
const app = express(); 

let PORT = 3000; 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/route?', (req, res) => {
  console.log(req.hostname);
  console.log(req.url);
  const url = req.query.url; 
  fs.readFile(dataFile, (err, data) => {
    if (err) throw err; 

    const dataObject = JSON.parse(data.toString('utf8'));
    let { count, urls } = dataObject; 

    if (isMiniUrl(url)) {
      const record = getRecord(url, dataObject);
      if (!record) {
        res.status(200).json({error: 'URL does not exist'});
      } else {
        res.redirect(301, record.originalUrl);
        // res.status(200).send(record);
      }
    } else {
        let shortUrl = `mini-${count++}`;
        const newRecord = { 
          originalUrl: url, 
          shortUrl: shortUrl
        };
        urls.push(newRecord);  
        dataObject.count = count;
      
        fs.writeFile(dataFile, JSON.stringify(dataObject), (err) => {
          if (err) throw err;
          res.status(200).json({shortUrl: shortUrl});
          res.end();
        })
      } 
  });
})

app.listen(PORT, () => {
  console.log(`Listening on Port: ${PORT}`);
})


function isMiniUrl(url) {
  return url.match(/mini-[0-9]+/g);
}

function getRecord(miniUrl, dataObject) {
  const index = miniUrl.slice(5);
  const recordFound = dataObject.urls[index]; 

  if (!recordFound) return null;
  else if (recordFound.shortUrl = miniUrl) return recordFound;
  else return null;
}

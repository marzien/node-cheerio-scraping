const request = require('request');
const cheerio = require('cheerio');
// const fs = require('fs');
const now = require("performance-now");
const sizeOf = require('image-size');
const url = require('url');
const https = require('https');
const http = require('http');

const link = 'https://mariusdev.tech';

// set some defaults
req = request.defaults({
	jar: true,                 // save cookies to jar
	rejectUnauthorized: false, 
	followAllRedirects: true   // allow redirections
});

request(link, (error, response, html) => {
  let start = now()
  if (!error && response.statusCode == 200) {

    const $ = cheerio.load(html);

    // Title
    let title = $("title").text(); 

    let h1count = 0;
    let h2count = 0;
    let h3count = 0;
    let h4count = 0;
    let h5count = 0;
    let h6count = 0;
    // Headings
    $("h1").each((i, el) => {
      h1count += 1;
    })

    $("h2").each((i, el) => {
      h2count += 1;
    })

    $("h3").each((i, el) => {
      h3count += 1;
    })

    $("h4").each((i, el) => {
      h4count += 1;
    })

    $("h5").each((i, el) => {
      h5count += 1;
    })

    $("h6").each((i, el) => {
      h6count += 1;
    })

    console.log('Headers H1: '+ h1count + ' H2:'+ h2count 
    + ' H3:'+ h3count + ' H4:'+ h4count + ' H5:'+ h5count + ' H6:'+ h6count)

    internalLinks = 0;
    externalLinks = 0;
    brokenLinks = 0;
    // All links  TODO: index.html, mailto
    $('a').each((i, el) => {
      const item = $(el).attr('href'); // all links
      // console.log(item);
      if (item.substring(0,4) === 'http' || item.substring(0,4) === 'wwww')  {
        externalLinks += 1;

        if(isURLBroken(item)) { // cheking only externa links
          brokenLinks += 1;
        };

      } else {
        internalLinks += 1;
      }
    })
    console.log('We have ' + internalLinks + 
    ' internal & ' + externalLinks + ' external and ' + brokenLinks + ' broken links')

    imgCount = 0
    // All images
    $('img').each((i, el) => { //TODO: bigest image
      imgCount += 1;
      const image = $(el).attr('src');
      imageSize(image);
    })
    // console.log("Links count: "+ imgCount)
  } else {
    console.log(response.statusCode)
    console.log(error)
  }
  let end = now()
  console.log('Execution time ' + (end-start).toFixed(3) + 'ms')
});


isURLBroken = (fullyQualifiedURL) => {
  const w3validator = 'https://validator.w3.org/nu/?doc=';
  let isBroken = false;
  // console.log(w3validator+fullyQualifiedURL);
  req.get({
    url: w3validator+fullyQualifiedURL,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
     }
  }, (err, resp, body) => {
	
	// load the html into cheerio
	let $ = cheerio.load(body);
  
  // let result = $('#results p strong').text()
  let result = $('.non-document-error p strong').text()
  // console.log(result);
  if(result == 'IO Error') {
    isBroken = true
    console.log("Site link not working");
    return isBroken;
  } else {
    console.log("Site link working");
    isBroken = false;
    return isBroken;
  }	
  console.log('isBroken '+isBroken);
  return isBroken;
});

imageSize = (imgUrl) => {
  var options = url.parse(link + '/' + imgUrl);

  // if main URL is https
  if (link.substring(0,5) === 'https') {
    https.get(options, function (response) {
      var chunks = [];
      response.on('data', function (chunk) {
        chunks.push(chunk);
      }).on('end', function() {
        var buffer = Buffer.concat(chunks);
        console.log(sizeOf(buffer));
      });
    });
  } else { // if main URL is http
    http.get(options, function (response) {
      var chunks = [];
      response.on('data', function (chunk) {
        chunks.push(chunk);
      }).on('end', function() {
        var buffer = Buffer.concat(chunks);
        console.log(sizeOf(buffer));
      });
    });
  }
}

};

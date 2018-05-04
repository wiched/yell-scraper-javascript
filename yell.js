var fs = require('fs');
// column Separator for the .csv export
var seperator = ',';

// settings up casperjs
var casper = require('casper').create({
  clientScripts: ['lib/jquery.min.js'], // Inject jquery library, allows use of $ variables
  verbose: true,
  logLevel: 'error',
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
    //userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36'
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X'
  }
});

// We create the CLI commands for the keyword, location and page
if (casper.cli.has("keyword")) {
  var keyword = casper.cli.get("keyword");
  console.log('Keyword Entered: ' + keyword)
} else {
  casper.die("No Keyword spesified.", 1);
}

if (casper.cli.has("location")) {
  var locationName = casper.cli.get("location");
  console.log('Location Entered: ' + locationName);
} else {
  casper.die("No location spesified.", 1);
}


if (casper.cli.has("page")) {
  var pageNum = casper.cli.get("page");
  console.log('Page Number Entered: ' + pageNum);
} else {
  // If page number is not provided we assume the first page of the query
  var pageNum = 1;
}

// we join the web query by parts
var webpage = 'https://www.yell.com/ucs/UcsSearchAction.do?location=' + locationName + '&keywords=' + keyword + '&scrambleSeed=192248850&pageNum=' + pageNum;

// access the generated page
casper.start(webpage);

casper.wait(1000, function () {
  // we create a screenshot of the result page
  casper.capture('img/result.jpg');
  // we create the .csv file with the column names
  fs.write("export/" + keyword + '-' + locationName + ".csv", 'Name' + seperator + 'URL' + seperator + 'Phone' + seperator + 'Address' + seperator + 'Town' + seperator + 'City' + seperator + 'Post' + "\n", "a");

  this.echo('result image captured');
})

// for getting company data from current page
casper.then(function () {
  var data = this.evaluate(function () {
    var nodes = document.querySelectorAll('.businessCapsule--mainContent'); // dive into company container
    return Array.prototype.map.call(nodes, function (node, i) {

      var url = '',
        phone = '',
        address = '',
        town = '',
        city = '',
        post = '';

      if (node.querySelector('.businessCapsule--ctas a')) {
        url = node.querySelector('.businessCapsule--ctas a').getAttribute('href');
      }
      if (node.querySelector('span[itemprop="telephone"]')) {
        phone = node.querySelector('span[itemprop="telephone"]').innerHTML.trim();
      }
      if (node.querySelector('span[itemprop="streetAddress"]')) {
        // we use replace with regex to remove the comma from  the address because it will add other columns to the exported csv
        address = node.querySelector('span[itemprop="streetAddress"]').innerHTML.replace(/,/g, '').trim();
      }
      if (node.querySelector('span[itemprop="addressLocality"]')) {
        town = node.querySelector('span[itemprop="addressLocality"]').innerHTML.trim();
      }
      if (node.querySelector('span[itemprop="addressRegion"]')) {
        city = node.querySelector('span[itemprop="addressRegion"]').innerHTML.replace(/,/g, '').trim();
      }
      if (node.querySelector('span[itemprop="postalCode"]')) {
        post = node.querySelector('span[itemprop="postalCode"]').innerHTML.replace(/,/g, '').trim();
      }
      return {
        // return the results and for the h2 we use childNodes[0].nodeValue to get only the title (sponsored results have span with text that we dont want)
        name: node.querySelector('h2').childNodes[0].nodeValue.trim(),
        url: url,
        phone: phone,
        address: address,
        town: town,
        city: city,
        post: post

      };
    })
  });
  // loop trought the result containers
  for (var i = 0; i < data.length; i++) {
    this.echo('name: ' + data[i]['name']);
    this.echo('url: ' + data[i]['url']);
    this.echo('phone: ' + data[i]['phone']);
    this.echo('address: ' + data[i]['address']);
    this.echo('town: ' + data[i]['town']);
    this.echo('city: ' + data[i]['city']);
    this.echo('post: ' + data[i]['post']);
    this.echo('-------------------------------');
    // export the results to the .csv
    fs.write("export/" + keyword + '-' + locationName + ".csv", data[i]['name'] + seperator + data[i]['url'] + seperator + data[i]['phone'] + seperator + data[i]['address'] + seperator + data[i]['town'] + seperator + data[i]['city'] + seperator + data[i]['post'] + "\n", "a");
    this.echo('DONE !!');
  }
});

// run the casperjs
casper.run();
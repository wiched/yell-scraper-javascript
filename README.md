# PhantomJs and CasperJs based scraper for scraping yellow pages from yell.com

<h2>Prerequisites</h2>

1. Download and install <a href="http://phantomjs.org/">PhantomJs</a>
```
npm install -g phantomjs
```
2. Download and install <a href="http://casperjs.org/">CasperJs</a>
```
npm install -g casperjs
```
<strong>On windows you have to add both phantomjs and casperjs to enviormental variables</strong>
<h2>How to run</h2>

open your commandline and navigate to project root directory where the yell.js file is and run following command

```casperjs yell.js --keyword="Window+Cleaning" --location="London" --page="2"```

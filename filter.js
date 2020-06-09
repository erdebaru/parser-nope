const inputFile = './input/2005.gse_zassan.txt';

const fs = require('fs'),
    readline = require('readline');

const rd = readline.createInterface({
    input: fs.createReadStream(inputFile),
    console: false
});

const linesno = JSON.parse(fs.readFileSync('./output/ids.json')).lines;

const line_counter = ((i = 0) => () => ++i)();

rd.on('line', (line,  lineno = line_counter()) => {
  if(!linesno.includes(lineno)){
    fs.appendFileSync('./output/export.txt', line + '\r\n');
  }
});

rd.on('close', function(){
  console.log("FINISHED");
});
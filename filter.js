const inputFile = process.argv[2];
const idsFile = process.argv[3]
const outputFile = process.argv[4];

var fs = require('fs');
const linesno = JSON.parse(fs.readFileSync(idsFile)).lines;

if(fs.existsSync(outputFile))
  fs.unlinkSync(outputFile);



var array = fs.readFileSync(inputFile).toString().split("\r\n");
console.log("array before filter:" + array.length);
for(var i=0; i < linesno.length; i++){
  array[linesno[i] - 1] = false;
}
array = array.filter(a => a);
console.log("array after filter:" + array.length);

fs.writeFileSync(outputFile, array.join('\r\n'));
console.log("done");
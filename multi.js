const fs = require('fs');
const {exec} = require("child_process");
const testFolder = process.argv[2];

fs.readdir(testFolder, function(err, files) {
  if(err) throw err;
  files.forEach(file => {
    console.log(file);
    exec(`node index-sync.js ${testFolder + '/' + file} ./output/ids-${file.split('.').slice(0, -1).join('.')}.json ./logs/${file.split('.').slice(0, -1).join('.')}.log`, function(err, out, errstd){
      if(err) throw err;
      console.log(out);
      exec(`node filter.js ${testFolder + '/' + file} ./output/ids-${file.split('.').slice(0, -1).join('.')}.json ./export/${file.split('.').slice(0, -1).join('.')}.txt`, function(err, out, stderr){
        if(err) throw err;
        console.log(out);
      });
    })
  });
});
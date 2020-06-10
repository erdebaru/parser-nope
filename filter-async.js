var fs = require('fs'),
    async = require('async'),
    carrier = require('carrier');

const linesno = JSON.parse(fs.readFileSync('./output/ids.json')).lines;

const line_counter = ((i = 0) => () => ++i)();

console.log(process.argv[2])
console.log(process.argv[3])

if(fs.existsSync(process.argv[3]))
  fs.unlinkSync(process.argv[3]);

async.parallel({
    input: fs.openFile.bind(null, process.argv[2], 'r'),
    output: fs.openFile.bind(null, process.argv[3], 'a')
}, function (err, result) {
    if (err) {
        console.log("An error occured: " + err);
        return;
    }

    carrier.carry(result.input)
        .on('line', (line,  lineno = line_counter()) => {
          if(linesno.indexOf(lineno) == -1){
            result.output.write(line);
          }
        })
        .on('end', function () {
            result.output.end();
            console.log("Done");
        });
});
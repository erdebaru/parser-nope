
const inputFile = process.argv[2];
const outputFile = process.argv[3];
const logFile = process.argv[4];
// const inputFile =  './input/5sar_gse.txt';
// const outputFile =  './output/5sar.json';
// const logFile =  './logs/logs.logs';
const sectionTrigger = "EVENT";


const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: logFile, options: { flags: 'w' } }),
  ],
});


const fs = require('fs');

var sectionBuffer = [];
var sectionStartIndex = 0;

const linesToRemove = [];

var skipNext = false;

var array = fs.readFileSync(inputFile).toString().split("\r\n");
console.log(array.length);
for(var i = 0; i < array.length; i++){
  let line = array[i];

  if(line.startsWith(sectionTrigger)){
    // EVENT reached
    skipNext = false;
    sectionStartIndex = i;
  }

  if(skipNext){
    continue;
  }

  if(i >= (sectionStartIndex + 9)){
    if(line.trim() === "" || line.startsWith("STOP")){
      skipNext = true;
      processBuffer(sectionBuffer, sectionStartIndex + 9);
      sectionBuffer = [];
    }else{
      sectionBuffer.push(line);
    }
  }
}

console.log("sectionBuffer:" + sectionBuffer.length);
if(sectionBuffer.length > 0){
  processBuffer(sectionBuffer, sectionStartIndex + 9);
}
logger.info("INPUT FILE READ COMPLETED");
logger.info("----");
logger.info("Lines To Remove:");

fs.writeFile(outputFile, JSON.stringify({
  lines: [...new Set(linesToRemove)]
}), function(){
  logger.info("Saved Ids to output/ids.json");
})


function processBuffer(buffer, startIndex){
  var k = 0;
  for(var i = 0; i < buffer.length; i++){
    if(k === i){
      continue;
    }

    
    if(isToBeRemoved(i + 1 + startIndex)){
      // Line has already been selected as removed;
      continue;
    }

    if(isToBeRemoved(k + 1 + startIndex)){
      // K has already been selected as removed;
      k += 1;
      i = 0;
      if(k === buffer.length){
        break;
      }else
        continue;
    }


    let first = parseLine(buffer[k], k + startIndex);
    let second = parseLine(buffer[i], i + startIndex);
    
    if(first.code === second.code){
      //Matching
      logger.info("Matching Set:");
      logger.info(first.code + " === " + second.code);
      logger.info(first.lineno + " ::: " + buffer[k]);
      logger.info(second.lineno + " ::: " + buffer[i]);
      if(first.value > second.value){
        logger.info("REMOVE:::" + first.lineno);
        addToRemove(first, second.lineno);
      }else if(first.value === second.value){
        if(first.is_new){
          logger.info("REMOVE:::" + second.lineno);
          addToRemove(second, first.lineno);
        }else{
          logger.info("REMOVE:::" + first.lineno);
          addToRemove(first, second.lineno);
        }
      }else{
        logger.info("REMOVE:::" + second.lineno);
        addToRemove(second, first.lineno);
      }
      logger.info("----");
    }
    if((i + 1) === buffer.length){
      //Last Line
      i = 0;
      k += 1;
    }
    if((k + 1) === buffer.length){
      break;
    }
  }
}

function addToRemove(line, exclude){
  if(!linesToRemove.includes(exclude)){
    linesToRemove.push(line.lineno);
  }
}

function isToBeRemoved(exclude){
  return linesToRemove.includes(exclude);
}

function parseLine(line, index){
	return {
    lineno: index + 1,
    code: line.substr(0, 3) + line.substr(23, 2),
    value: parseFloat(line.substr(53, 59).trim().replace(/-/gm, '')),
    is_new: line.substr(0, 4).trim().length === 4
  }
}

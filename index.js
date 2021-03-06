
// const inputFile = './input/2005.gse_zassan.txt';
const inputFile = process.argv[2];
const sectionTrigger = "EVENT";


const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});


const fs = require('fs'),
    readline = require('readline');

const rd = readline.createInterface({
    input: fs.createReadStream(inputFile),
    console: false
});

var sectionBuffer = [];
var sectionStartIndex = 0;
const line_counter = ((i = 0) => () => ++i)();
const linesToRemove = [];

var skipNext = false;
rd.on('line', (line,  lineno = line_counter()) => {
  
  if(line.startsWith(sectionTrigger)){
    // EVENT reached
    skipNext = false;
    sectionStartIndex = lineno;
  }
  if(lineno >= (sectionStartIndex + 9)){
    if(line.trim() === ""){
      if(skipNext){
        return;
      }
      skipNext = true;
      processBuffer(sectionBuffer, sectionStartIndex + 9);
      sectionBuffer = [];
    }else{
      sectionBuffer.push(line);
    }
  }
});

rd.on('close', function(){
  console.log("sectionBuffer:" + sectionBuffer.length);
  if(sectionBuffer.length > 0){
    processBuffer(sectionBuffer, sectionStartIndex + 9);
  }
  logger.info("INPUT FILE READ COMPLETED");
  logger.info("----");
  logger.info("Lines To Remove:");
  
  logger.info(JSON.stringify([...new Set(linesToRemove)]));
  fs.writeFile('./output/ids.json', JSON.stringify({
    lines: [...new Set(linesToRemove)]
  }), function(){
    logger.info("Saved Ids to output/ids.json");
  })
});


function processBuffer(buffer, startIndex){
  var k = 0;
  for(var i = 0; i < buffer.length; i++){
    if(k === i){
      continue;
    }
    if(linesToRemove.includes(i + startIndex)){
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

function parseLine(line, index){
	return {
    lineno: index,
    code: line.substr(0, 3) + line.substr(23, 2),
    value: parseFloat(line.substr(53, 59).trim()),
    is_new: line.substr(0, 4).trim().length === 4
  }
}

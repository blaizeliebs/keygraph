let fs = require('fs');
let path = require('path');
let _ = require('underscore');

let excludes = [
  // path.join(__dirname, './src/site')
];

let srcDir = path.join(__dirname, './artisan');

recurseDirectory(srcDir);

function recurseDirectory(directory) {
  let items = fs.readdirSync(directory);
  _.each(items, (item) => {
    if (item != '.' && item != '..') {
      if (fs.lstatSync(`${directory}/${item}`).isDirectory()) {
        if (_.contains(excludes, `${directory}/${item}`)) {
          console.log(`SKIPPING: ${directory}/${item}`);
        } else {
          // recurseDirectory(`${directory}/${item}`);
        }
      } else if (path.extname(item) == '.js') {
        console.log(`${directory}/${item}`);
        updateFile(`${directory}/${item}`);
      }
    }
    process.exit()
  });
}

function updateFile(file) {
  let data = fs.readFileSync(file, 'utf-8');

  let importMatches = data.match(/import\s(?:\*\sas\s)?(.*?)\sfrom\s(.*?)(\n|;)/);
  while (importMatches) {
    console.log(importMatches);
    // console.log(data.replace(/import\s(?:\*\sas\s)?(.*?)\sfrom\s(.*?)(\n|;)/, 'let $1 = require($2);'));
    // console.log(`IMPORT MATCHES LENGTH: ${importMatches.length}`);
    // console.log(importMatches[2]);
    // console.log(importMatches[2].substr(importMatches[2].length - 2, 1));
    if (importMatches[2].substr(importMatches[2].length - 2, 1) == '/' && !importMatches[1].match(/\{.*?\}/)) {
      // process.exit();
      data = data.replace(/import\s(?:\*\sas\s)?(.*?)\sfrom\s(.*?)(\n|;)/, 'let { $1 } = require($2);\n');
    }
    data = data.replace(/import\s(?:\*\sas\s)?(.*?)\sfrom\s(.*?)(\n|;)/, 'let $1 = require($2);\n');
    importMatches = data.match(/import\s(?:\*\sas\s)?(.*?)\sfrom\s(.*?)(\n|;)/);
  }
  // console.log(data);

  let exportMatches = data.match(/export\s\{([\d\D\s,\n]*)?\};?/);
  // console.log(exportMatches);
  if (exportMatches) {
    let exports = _.map(exportMatches[1].split(','), (exp) => {
      return exp.replace('as default', '').trim();
    });
    // console.log(exports);
    let stringExpot = 'module.exports = {';
    _.each(exports, (exp) => {
      if (exp.replace(' ', '')) {
        stringExpot += `\n  ${exp},`;
      }
    })
    stringExpot += '\n};';
    data = data.replace(exportMatches[0], stringExpot);
    // console.log(data);
  }

  exportMatches = data.match(/export\sdefault\s(.*?)(?:\n|;)/);
  if (exportMatches) {
    data = data.replace(exportMatches[0], `module.exports = ${exportMatches[1]};`);
  }
  fs.writeFileSync(file, data);
}

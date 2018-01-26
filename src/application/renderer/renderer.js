module.exports = function Renderer(){
  const ejs = require('ejs');
  const path = require('path');
  const fs = require('fs');
  let renderer = {};

  renderer.render = function(file, data){
    let filename = path.join(__dirname, 'views', file + ".ejs");
    let fileString = fs.readFileSync(filename, {encoding: 'utf-8'});
    let rendered = ejs.render(fileString, data, {});
    if (!rendered){
      return "";
    }
    return rendered;
  };

  return renderer;
};
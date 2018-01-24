module.exports = function Listr(){
  let listr = {};
  listr.storage = require('./common/storage')();
  listr.lists = {};

  listr.deleteList = function(listID){
    let list = listr.lists[listID];
    if(typeof list === "undefined") {
      return false;
    }
    delete listr.lists[listID];
    return true;
  };

  listr.createList = function(listName, category){
    let newList = require('./proto/list')(listName, category);
    listr.lists[newList.meta.id] = newList;
    return newList;
  };

  return listr;
};
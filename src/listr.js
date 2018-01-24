module.exports = function Listr(){
  let listr = {};
  listr.storage = require('./common/storage')();
  listr.application = require('./application')(listr);
  listr.lists = {};

  listr.deleteList = function(listID){
    let list = listr.lists[listID];
    if(typeof list === "undefined") {
      return false;
    }
    delete listr.lists[listID];
    return true;
  };

  listr.showLists = function(){
    return Object.values(listr.lists);
  };

  listr.listByID = function(listID){
    let list = listr.lists[listID];
    
    if (!listr.lists.hasOwnProperty(listID) || typeof list === "undefined"){
      return false;
    }

    return list;
  };

  listr.createList = function(listName, category){
    let newList = require('./proto/list')(listName, category);
    listr.lists[newList.meta.listID] = newList;
    return newList;
  };

  return listr;
};
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

  listr.addTodo = function(listID, todoText, cb){
    cb = cb || function(){};
    let list = listr.listByID(listID);
    if (list){
      list.createTodo(todoText);
      cb();
      return true;
    }
    return false;
  };

  listr.updateTodo = function(listID, todoID, todoText, cb){
    cb = cb || function(){};
    let list = listr.listByID(listID);
    let todo = list.todoByID(todoID);
    if(list && todo){
      todo.task = todoText;
      console.log("UPDATED");
      cb();
      return true;
    }
    return false;
  };

  listr.completeTodo = function(listID, todoID, completed, cb){
    cb = cb || function(){};
    let list = listr.listByID(listID);
    let todo = list.todoByID(todoID);
    if (list && todo){
      todo.completeTask(completed);
      return cb();
    }
    return false;
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
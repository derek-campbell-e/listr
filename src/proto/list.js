module.exports = function List(listName, category, listFile){
  listFile = listFile || {};

  const uuid = require('../common/uuid');

  let list = {};
  let todo = require('./todo');

  list.meta = {};
  list.meta.listID = uuid();
  list.meta.name = listName;
  list.meta.category = category || 'default';

  list.todos = {};

  list.createTodo = function(task, category, timing){
    let newTodo = new todo();
    newTodo.addTask(task, category);
    let taskTiming = newTodo.calculateTiming(timing);
    let todoID = uuid();
    newTodo.meta.id = todoID;
    list.todos[todoID] = newTodo.export();
    return todoID;
  };

  // checks filter object and returns true if object should be returned
  list.filterTodo = function(filter, todo){
    let shouldReturn = true;

    let existsAndTrue = function(obj, property){
      if(obj.hasOwnProperty(property) && obj[property]){
        return true;
      }
      return false;
    };

    if(existsAndTrue(filter, 'incomplete')){
      if(todo.meta.isComplete){
        shouldReturn = false;
      }
    }

    if(existsAndTrue(filter, 'complete')){
      if(!todo.meta.isComplete){
        shouldReturn = false;
      }
    }

    if(existsAndTrue(filter, 'category')){
      if(todo.meta.category !== filter['category']){
        shouldReturn = false;
      }
    }


    return shouldReturn;

  };

  list.deleteTodo = function(todoID){
    let todo = list.todos[todoID];
    if(typeof todo === "undefined"){
      return false;
    }
    delete list.todos[todoID];
    return true;
  };

  list.showTodos = function(filter){
    filter = filter || {};
    let todos = [];
    for(let todoID in list.todos){
      let todo = list.todos[todoID];
      if(list.filterTodo(filter, todo)){
        todos.push(todo);
      }
    }
    return todos;
  };

  list.completeTodo = function(todoID){
    let todo = list.todos[todoID];
    if(typeof todo === "undefined"){
      return false;
    }
    return todo.completeTask();
  };

  let init = function(){
    return list;
  };

  return init();
};
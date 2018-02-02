module.exports = function Todo(){
  let todo = {};
  todo.meta = {};
  todo.meta.isComplete = false;

  todo.task = null;

  todo.completeTask = function(completed){
    todo.meta.isComplete = completed;
    return true;
  };
  
  todo.addTask = function(taskString, category){
    category = category || 'default';
    todo.task = taskString;
    todo.meta.category = category;
  };

  todo.calculateTiming = function(timing){
    timing = timing || {};
    let timingObject = {};
    timingObject.dueDateTime = false;
    timingObject.repeatingEveryUnit = false;
    timingObject.repeatingEveryAmount = false;

    for(let key in timingObject){
      if(timing.hasOwnProperty(key) && typeof timing[key] !== "undefined"){
        timingObject[key] = timing[key];
      }
    }
   
    return timingObject;
  };

  todo.timing = function(dueDateTime, repeatingEveryUnit, repeatingEveryAmount){
    dueDateTime = dueDateTime || false;
    repeatingEveryUnit = repeatingEveryUnit || false;
    repeatingEveryAmount = repeatingEveryAmount || false;
  };

  todo.export = function(){
    let tExport = {};
    tExport.meta = todo.meta;
    tExport.task = todo.task;
    return todo;
    return tExport;
  };

  return todo;
};
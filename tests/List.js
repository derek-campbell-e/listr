const assert = require('assert');
const List = require('../src/proto/list')();
let trackedTodos = [];

describe("List", function(){

  describe("#createTodo", function(){
    it("should be able to create a new todo", function(){
      let todoID = List.createTodo('this is my task');
      trackedTodos.push(todoID);
    });
  });

  describe("#completeTodo", function(){
    it("shoud let todos be completed from the list", function(){
      let thisTodoID = List.createTodo("A new todo");
      trackedTodos.push(thisTodoID);
      assert(List.completeTodo(thisTodoID));
    });
  });

  describe("#showTodos", function(){
    it("should show the todos in a list, using filters", function(){
      let anotherTodo = List.createTodo("new test task", "DEVELOPMENT");
      trackedTodos.push(anotherTodo);
      let incompleteTodos = List.showTodos({incomplete: true}); // should show only incomplete todos
      let completeTodos = List.showTodos({complete: true}); // should show only complete todos
      let categoryTodos = List.showTodos({category: "DEVELOPMENT"});
      assert(incompleteTodos.length === 2);
      assert(completeTodos.length === 1);
      assert(categoryTodos.length === 1);
    });
  });

  describe("#deleteTodo", function(){
    it("should delete a todo from the list", function(){
      let testTodoID = List.createTodo("another test task");
      List.deleteTodo(testTodoID);
      assert(!List.todos[testTodoID]);
    });
  });



  
});
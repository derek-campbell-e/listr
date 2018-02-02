module.exports = function ListrRenderer(){
  window.$ = window.jQuery = require('jquery');
  const {ipcRenderer} = require('electron');
  let renderer = require('./renderer')();

  let listr = {};

  listr.current = {};
  listr.current.list = null;
  listr.current.listObject = {};

  listr.helpers = {};
  listr.helpers.todoID = function(){
    return $(this).closest("tr").attr('data-row-id');
  };

  listr.delegates = {};
  listr.delegates.onPageLoad = function(){

  };

  listr.hasTodos = function(list){
    return Object.values(list.todos).length > 0;
  };

  listr.render = {};

  listr.render.insertTodo = function(){
    return renderer.render('new-todo');
  };
  
  listr.render.todo = function(todo){
    return renderer.render('todo-each', {todo: todo});
  };

  listr.render.todosPerList = function(list){
    return renderer.render('list-todos', {list: list});
  };

  listr.render.showListTodosInContentPanel = function(list){
    let contentPanel = $("#content-panel");
    let listTodosHTML = listr.render.todosPerList(list);
    contentPanel.html(listTodosHTML);
  };
  
  listr.delegates.onClickAddTodo = function(){
    let listID = $(this).attr('data-list-id');
    let dom = $(".todo-table");
    dom.append(listr.render.insertTodo());
    $(document).on('keydown', '.add-todo-input', listr.delegates.onPressEnterTodo);
  };

  listr.delegates.onPressEnterTodo = function(e){
    if(e.which !== 13){
      return true;
    }
    let todoText = $(this).val();
    ipcRenderer.send('add-todo', listr.current.list.meta.listID, todoText);
    $(document).off('keydown', '.add-todo-input');
  };

  listr.delegates.onClickListInSidebar = function(event, manualListID){
    let listID = $(this).attr('id') || manualListID;
    let list = ipcRenderer.sendSync('get-list-by-id', listID);
    if(list){
      listr.render.showListTodosInContentPanel(list);
      listr.current.list = list;
    }
  };

  listr.delegates.onPageData = function(event, page, data){
    switch(page){
      case 'index':
        // load up all the lists into the view
        console.log(data);
        listr.current.listrLists = data;
        let dom = $("#main-list");
        let html = "";
        for(let index in data){
          let list = data[index];
          let numberOfTodos = Object.keys(list.todos).length;
          html += "<li class='item' id='"+list.meta.listID+"'>"+list.meta.name+"<span class='badge badge-primary'>"+numberOfTodos+"</span></li>"
        }
        let firstList = data[0];
        listr.render.showListTodosInContentPanel(firstList);
        listr.current.list = firstList;
        dom.html(html);
      break;
    }
  };

  listr.delegates.onEnterTodoUpdate = function(event){
   
    if(event.which !== 13){
      return true;
    }

    let todoID = $(this).closest(".todo-task").attr('id');
    let todoText = $(this).val();
    ipcRenderer.send('update-todo', listr.current.list.meta.listID, todoID, todoText);
  };

  listr.delegates.onClickCompleteTodo = function(event){
    let todoID = listr.helpers.todoID.call(this);
    console.log(listr.current.list);
    let todoStatus = listr.current.list.todos[todoID].meta.isComplete;
    console.log(todoStatus, "BEFORE REVERSE");
    todoStatus = !todoStatus;
    console.log(todoID, todoStatus);
    ipcRenderer.send('complete-todo', listr.current.list.meta.listID, todoID, todoStatus);
  };

  listr.delegates.updateListrDashboard = function(event, updatedListID, allLists){
    let dom = $("#main-list");
    let html = "";
    listr.current.listrLists = allLists;
    for(let index in allLists){
      let list = allLists[index];
      let numberOfTodos = Object.keys(list.todos).length;
      let listDom = $("#"+list.meta.listID);
      listDom.find(".badge").text(numberOfTodos);
    }
    listr.delegates.onClickListInSidebar(event, updatedListID, allLists);
  };

  listr.bind = function(){
    ipcRenderer.on('page-data', listr.delegates.onPageData);
    ipcRenderer.on('refresh-list', listr.delegates.updateListrDashboard);
    $(document).on('click', '#main-list .item', listr.delegates.onClickListInSidebar);
    $(document).on('click', '.add-todo', listr.delegates.onClickAddTodo);
    $(document).on('keydown', '.todo-input', listr.delegates.onEnterTodoUpdate);
    $(document).on('click', '.todo-checkbox-td i', listr.delegates.onClickCompleteTodo);
  };

  let init = function(){
    ipcRenderer.send('page-load', 'index');
    listr.bind();
    return listr;
  };

  return init();
};
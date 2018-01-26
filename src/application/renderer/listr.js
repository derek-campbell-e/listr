module.exports = function ListrRenderer(){
  window.$ = window.jQuery = require('jquery');
  const {ipcRenderer} = require('electron');
  let renderer = require('./renderer')();

  let listr = {};

  listr.current = {};
  listr.current.list = null;

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
    alert(listr.current.list);
    $(document).off('keydown', '.add-todo-list');
  };

  listr.delegates.onClickListInSidebar = function(){
    let listID = $(this).attr('id');
    let list = ipcRenderer.sendSync('get-list-by-id', listID);
    if(list){
      listr.render.showListTodosInContentPanel(list);
      listr.current.list = listID;
    }
  };

  listr.delegates.onPageData = function(event, page, data){
    switch(page){
      case 'index':
        // load up all the lists into the view
        console.log(data);
        let dom = $("#main-list");
        let html = "";
        for(let index in data){
          let list = data[index];
          let numberOfTodos = Object.keys(list.todos).length;
          html += "<li class='item' id='"+list.meta.listID+"'>"+list.meta.name+"<span class='badge badge-primary'>"+numberOfTodos+"</span></li>"
        }
        let firstList = data[0];
        listr.render.showListTodosInContentPanel(firstList);
        listr.current.list = firstList.meta.listID;
        dom.html(html);
      break;
    }
  };

  listr.bind = function(){
    ipcRenderer.on('page-data', listr.delegates.onPageData);
    $(document).on('click', '#main-list .item', listr.delegates.onClickListInSidebar);
    $(document).on('click', '.add-todo', listr.delegates.onClickAddTodo);
  };

  let init = function(){
    ipcRenderer.send('page-load', 'index');
    listr.bind();
    return listr;
  };

  return init();
};
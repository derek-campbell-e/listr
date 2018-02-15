module.exports = function ListrRenderer(){
  window.$ = window.jQuery = require('jquery');
  const {ipcRenderer} = require('electron');
  const {Draggable} = require('@shopify/draggable');
  const {Sortable} = require('@shopify/draggable');
  let renderer = require('./renderer')();
  const calendar = require('./js/calendar');

  let listr = {};

  listr.current = {};
  listr.current.list = null;
  listr.current.listObject = {};

  listr.helpers = {};
  listr.helpers.todoID = function(){
    return $(this).closest("tr").attr('data-row-id');
  };

  listr.helpers.checkmarkText = function(status){
    status = status || false;
    let text = "check_box_outline_blank";
    if(status){
      text = "check_box";
    }
    return text;
  };

  listr.helpers.getSortOrder = function(){
    let todoRows = $(".todo-table").find("tr");
    let sortedIDs = [];
    todoRows.each(function(i,e){
      let todoID = $(e).attr('data-row-id');
      sortedIDs.push(todoID);
    });
    return sortedIDs;
  };

  listr.delegates = {};
  listr.delegates.onPageLoad = function(){

  };

  listr.hasTodos = function(list){
    return Object.values(list.todos).length > 0;
  };

  listr.render = {};

  listr.render.calendar = function(){
    let dom = $("#calendar");
    calendar(dom);
  };

  listr.render.insertTodo = function(){
    return renderer.render('new-todo');
  };
  
  listr.render.todo = function(todo){
    return renderer.render('todo-each', {todo: todo});
  };

  listr.render.todosPerList = function(list){
    let sortedTodos = ipcRenderer.sendSync('show-sorted-todos', list.meta.listID);
    return renderer.render('list-todos', {list: list, sortedTodos: sortedTodos});
  };

  listr.render.completeTodoTask = function(todoID, completed){
    let dom = $("[data-row-id="+todoID+"]");
    dom.find(".todo-checkbox").text(listr.helpers.checkmarkText(completed));
    if(completed){
      dom.removeClass('todo-complete-false').addClass('todo-complete-true');
    } else {
      dom.removeClass('todo-complete-true').addClass('todo-complete-false');
    }
    
  };

  listr.render.showListTodosInContentPanel = function(list){
    let contentPanel = $("#content-panel");
    let listTodosHTML = listr.render.todosPerList(list);

    contentPanel.html(listTodosHTML);
    listr.dragging = new Sortable(
      $(".todo-table tbody").get(0), 
      {
        draggable: 'tr', 
        handle:'.todo-drag', 
        appendTo: '.todo-table tbody',
        mirror: {
          xAxis: false,
          constrainDimensions: true,
        },
      }
    );
    listr.dragging.on('sortable:start', () => console.log('drag:start'));
    listr.dragging.on('sortable:stop', listr.delegates.onCompleteSorting);
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
      console.log("HAVE THE LIST");
      $("#main-list").find(".active").removeClass('active');
      $("[data-list-id="+listr.current.list.meta.listID+"]").addClass('active');
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
          html += "<li class='item' id='"+list.meta.listID+"' data-list-id='"+list.meta.listID+"'>"+list.meta.name+"<span class='badge badge-primary'>"+numberOfTodos+"</span></li>"
        }
        let firstList = data[0];
        //listr.render.showListTodosInContentPanel(firstList);
        listr.current.list = firstList;
        dom.html(html);
        listr.delegates.onClickListInSidebar(null, firstList.meta.listID);
        
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
    let todoStatus = ipcRenderer.sendSync('get-list-by-id', listr.current.list.meta.listID).todos[todoID].meta.isComplete;
    todoStatus = !todoStatus;
    ipcRenderer.send('complete-todo', listr.current.list.meta.listID, todoID, todoStatus);
  };

  listr.delegates.onCompleteSorting = function(event){
    setTimeout(function(){
      let listID = listr.current.list.meta.listID;
      let sortOrder = listr.helpers.getSortOrder();
      ipcRenderer.send('update-sort-order', listID, sortOrder);
    }, 500);
  
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

  listr.delegates.softUpdateListrDashboard = function(event, updatedListID, allLists, todoID, completed){
    console.log("SOFT UPDATE", todoID, completed);
    listr.current.listrLists = allLists;
    for(let index in allLists){
      let list = allLists[index];
      let numberOfTodos = Object.keys(list.todos).length;
      let listDom = $("#"+list.meta.listID);
      listDom.find(".badge").text(numberOfTodos);
    }
    listr.render.completeTodoTask(todoID, completed);
    //listr.delegates.onClickListInSidebar(event, updatedListID, allLists);
  };

  listr.bind = function(){
    ipcRenderer.on('page-data', listr.delegates.onPageData);
    ipcRenderer.on('refresh-list', listr.delegates.updateListrDashboard);
    ipcRenderer.on('refresh-list-soft', listr.delegates.softUpdateListrDashboard);
    $(document).on('click', '#main-list .item', listr.delegates.onClickListInSidebar);
    $(document).on('click', '.add-todo', listr.delegates.onClickAddTodo);
    $(document).on('keydown', '.todo-input', listr.delegates.onEnterTodoUpdate);
    $(document).on('click', '.todo-checkbox-td i', listr.delegates.onClickCompleteTodo);
  };

  let init = function(){
    ipcRenderer.send('page-load', 'index');
    listr.bind();
    listr.render.calendar();
    
    return listr;
  };

  return init();
};
module.exports = function ListrRenderer(){
  window.$ = window.jQuery = require('jquery');
  const {ipcRenderer} = require('electron');
  let listr = {};

  listr.delegates = {};
  listr.delegates.onPageLoad = function(){

  };

  listr.hasTodos = function(list){
    return Object.values(list.todos).length > 0;
  };

  listr.render = {};
  
  listr.render.todo = function(todo){
    let html = "";
    html += "<td class='todo-checkbox-td'>" + '<i class="material-icons todo-checkbox">check_box_outline_blank</i>' + "</td>";
    html += "<td class='todo-task'><div><h2>" + todo.task + "</h2><p>"+todo.meta.category+"</p></div></td>";
    return html;
  };

  listr.render.todosPerList = function(list){
    let html = "<div class='list-todos'>";
    html += "<h1>"+list.meta.name+"</h1>";
    
    if (!listr.hasTodos(list)) {
      html += "Add a todo!";
      html += "</div>";
      return html;
    }

    html += "<table class='todo-table'>";
    for(let todoID in list.todos){
      let todo = list.todos[todoID];
      html += "<tr>" + listr.render.todo(todo) + "</tr>";
    }
    html += "</table>";
    html += "</div>";
    return html;
  };

  listr.render.showListTodosInContentPanel = function(list){
    let contentPanel = $("#content-panel");
    let listTodosHTML = listr.render.todosPerList(list);
    contentPanel.html(listTodosHTML);
  };

  listr.delegates.onClickListInSidebar = function(){
    let listID = $(this).attr('id');
    let list = ipcRenderer.sendSync('get-list-by-id', listID);
    if(list){
      listr.render.showListTodosInContentPanel(list);
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
        dom.html(html);
      break;
    }
  };

  listr.bind = function(){
    ipcRenderer.on('page-data', listr.delegates.onPageData);
    $(document).on('click', '#main-list .item', listr.delegates.onClickListInSidebar);
  };

  let init = function(){
    ipcRenderer.send('page-load', 'index');
    listr.bind();
    return listr;
  };

  return init();
};
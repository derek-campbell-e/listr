module.exports = function ListrRenderer(){
  window.$ = window.jQuery = require('jquery');
  const {ipcRenderer} = require('electron');
  let listr = {};

  listr.delegates = {};
  listr.delegates.onPageLoad = function(){

  };

  listr.delegates.onPageData = function(event, page, data){
    switch(page){
      case 'index':
        // load up all the lists into the view
        console.log(data);
        let dom = $(".listr-lists");
        let html = "";
        for(let index in data){
          let list = data[index];
          let numberOfTodos = Object.keys(list.todos).length;
          html += "<li class='list-group-item'>"+list.meta.name+"<span class='badge badge-primary'>"+numberOfTodos+"</span></li>"
        }
        dom.html(html);
      break;
    }
  };

  listr.bind = function(){
    ipcRenderer.on('page-data', listr.delegates.onPageData);
  };

  let init = function(){
    ipcRenderer.send('page-load', 'index');
    listr.bind();
    return listr;
  };

  return init();
};
module.exports = function ListrApplication(Listr){

  const electron = require('electron')
  // Module to control application life.
  const app = electron.app
  const ipcMain = electron.ipcMain;

  if(typeof app === 'undefined') {
    return;
  }
  // Module to create native browser window.
  const BrowserWindow = electron.BrowserWindow
  
  const path = require('path')
  const url = require('url')
  
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.

  let application = {};
  application.mainWindow = null;
  application.indexPage = path.join(__dirname, 'renderer', 'index.html');

  

  application.delegates = {};
  application.delegates.onWindowLoad = function(){
    let list = Listr.createList('Schoolwork', 'Education');
    let kitchen = Listr.createList('Kitchen Chores', 'Home');
    Listr.createList('Bedroom Chores', 'Home');
    list.createTodo("OMG", "DEFAULT");
    list.createTodo("Test 2", "DEFAULT");
    list.createTodo("Another Task", "DEFAULT");
    kitchen.createTodo("Wipe counters", "CLEANING");
    kitchen.createTodo("Wash Dishes", "CLEANING");

    console.log(Listr.showLists());
  };

  application.delegates.onPageLoad = function(event, pageArg){
    switch(pageArg){
      case 'index':
        event.sender.send('page-data', pageArg, Listr.showLists());
      break;
    }
  };

  application.delegates.getListByID = function(event, listID){
    
    let list = Listr.listByID(listID);
    console.log("GOT REQUEST", listID, list);
    event.returnValue = list;
    return event;
  };

  ipcMain.on('page-load', application.delegates.onPageLoad);
  ipcMain.on('get-list-by-id', application.delegates.getListByID);


  let mainWindow
  
  function createWindow () {
    // Create the browser window.
    application.delegates.onWindowLoad();
    application.mainWindow = new BrowserWindow({width: 1000, height: 600, x: -1200, y: 300})
  
    // and load the index.html of the app.
    application.mainWindow.loadURL(url.format({
      pathname: application.indexPage,
      protocol: 'file:',
      slashes: true
    }))
  
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
  
    // Emitted when the window is closed.
    application.mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      application.mainWindow = null
    })
  }
  
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)
  
  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow()
    }
  });

  return application;
  
  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.
  
};
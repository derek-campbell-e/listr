const assert = require('assert');
const Listr = require('../index');

describe("Listr", function(){
  
  describe("#createList", function(){
    it("should create a new list", function(){
      let list = Listr.createList("Schoolwork", "Education");
      //console.log(list);
    });
  });

  describe("#deleteList", function(){
    it("should delete a list", function(){
      let list = Listr.createList("DEVELOPMENT", "TEST");
      let listID = list.meta.id;
      Listr.deleteList(listID);
      assert(!Listr.lists[listID]);
    });
  });



});
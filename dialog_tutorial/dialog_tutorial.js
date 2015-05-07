$(document).ready(function() {
  $("#button").click(function() {
    addItem("task1", "due1");
  });

  $("#open-dialog-btn").click(function() {
    gadgets.views.openGadget(function(result){
      addItem(result["task"], result["due"]);
      gadgets.window.adjustHeight();
    }, 
    function(site){}, 
    {view: "dialog",viewTarget: "DIALOG"});
  });
});

var addItem = function(task, due) {
  var item = $('<tr></tr>');
  var col1 = $('<td></td>').append($('<input>').attr({
    type: "checkbox",
    name: "done"
  }));
  var col2 = $('<td></td>').text(task);
  var col3 = $('<td></td>').text(due);
  item.append(col1, col2, col3);

  $("#table").append(item);
  gadgets.window.adjustHeight();
};

// var init = function() {

// };

// gadgets.util.registerOnLoadHandler(init)

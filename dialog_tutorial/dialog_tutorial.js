$(document).ready(function() {
  $("#button").click(function() {
    var item = $('<tr></tr>');
    var col1 = $('<td></td>').append($('<input>').attr({
      type: "checkbox",
      name: "done"
    }));
    var col2 = $('<td></td>').text('col2');
    var col3 = $('<td></td>').text('col3');
    item.append(col1, col2, col3);

    $("#table").append(item);
  });

  $("#open-dialog-btn").click(function() {
    gadgets.views.openGadget(function(result){
      var item = $('<tr></tr>');
      var col1 = $('<td></td>').append($('<input>').attr({
        type: "checkbox",
        name: "done"
      }));
      var col2 = $('<td></td>').text(result["task"]);
      var col3 = $('<td></td>').text(result["due"]);
      item.append(col1, col2, col3);

      $("#table").append(item);
    }, 
    function(site){}, 
    {view: "dialog",viewTarget: "DIALOG"});
  });
});

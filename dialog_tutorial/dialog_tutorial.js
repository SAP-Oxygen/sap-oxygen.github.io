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
    gadgets.views.openGadget(function(result){}, 
      function(site){}, 
      {view: "DIALOG",viewTarget: "dialog"});
  });
});

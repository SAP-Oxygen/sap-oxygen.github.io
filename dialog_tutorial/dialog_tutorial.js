$(document).ready(function() {
  $("#button").click(function() {
    addItem("task1", "due1");
  });

  $("#open-dialog-btn").click(function() {
    gadgets.views.openGadget(function(result){
      var waveEntry = {};
      waveEntry[result["task"]] = $.extend(result, {timestamp: new Date().getTime()});
      wave.getState().submitDelta(waveEntry);
      gadgets.window.adjustHeight();
    }, 
    function(site){}, 
    {view: "dialog",viewTarget: "DIALOG"});
  });
});

var createRow = function(item) {
  var item = $('<tr></tr>');
  var col1 = $('<td></td>').append($('<input>').attr({
    type: "checkbox",
    name: "done"
  }));
  var col2 = $('<td></td>').text(item["task"]);
  var col3 = $('<td></td>').text(item["due"]);
  item.append(col1, col2, col3);

  return item;
};

var createList = function(items) {
  var tableDiv = $("#updated-div").attr("style", "display: block").clone();
  var table = tableDiv.children();
  $.each(items, function(index, item){
    var row = createRow(item);
    table.append(row);
  })
  table.attr("id", "init-table");
  $("#init-table").replaceWith(table);
  gadgets.window.adjustHeight();
};

var render = function() {
  var waveData = [];
  var waveState = wave.getState();
  $.each(waveState.getKeys(), function(index, key) {
    waveData[index] = waveState.get(key);
  });
  waveData.sort(function(a, b) {
    return a.timestamp - b.timestamp;
  });
  createList(waveData);
};

var init = function() {
  wave.setStateCallback(render);
};

gadgets.util.registerOnLoadHandler(init)

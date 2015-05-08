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
  var table = $('<table></table>').attr({
    id: "init-table",
    style: "width: 100%");
  var header = $('<tr></tr>');
  var col1 = $('<td></td>').text("Done");
  var col2 = $('<td></td>').text("Todo");
  var col3 = $('<td></td>').text("Due");
  table.append(header.append(col1, col2, col3));
  $.each(items, function(index, item){
    var row = createRow(item);
    table.append(row);
  })
  console.log("created a list: " + table);
  $("#init-table").replaceWith(table);
  gadgets.window.adjustHeight();
};

var render = function() {
  var waveData = [];
  var waveState = wave.getState();
  $.each(waveState.getKeys(), function(index, key) {
    waveData[index] = waveState.get(key);
  });
  console.log("data from wave (not sorted): " + waveData);
  waveData.sort(function(a, b) {
    return a.timestamp - b.timestamp;
  });
  console.log("data from wave (sorted): " + waveData);
  createList(waveData);
};

var init = function() {
  wave.setStateCallback(render);
};

gadgets.util.registerOnLoadHandler(init)

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

var render = function() {
  var waveData = [];
  var waveState = wave.getState();
  $.each(waveState.getKeys(), function(index, key) {
    waveData[index] = waveState.get(key);
  });
  waveData.sort(function(a, b) {
    return a.timestamp - b.timestamp;
  });
  $.each(waveData, function(index, item){
    addItem(item["task"], item["due"]);
  });
};

var init = function() {
  wave.setStateCallback(render);
};

gadgets.util.registerOnLoadHandler(init)

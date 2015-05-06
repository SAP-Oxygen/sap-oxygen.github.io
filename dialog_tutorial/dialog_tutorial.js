$(document).ready(function() {
  $("#button").click(function() {
    var item = $('<tr></tr>');
    var col1 = $('<td></td>').text('col1');
    var col2 = $('<td></td>').text('col2');
    var col3 = $('<td></td>').text('col3');
    item.append(col1, col2, col3);

    $("#table").append(item);
  });
});

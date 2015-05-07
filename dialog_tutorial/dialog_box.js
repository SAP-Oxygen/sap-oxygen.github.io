$(document).ready(function() {
  $("#submit-btn").click(function() {
    var task = $("#task").val();
    var due = $("#due").val();
    gadgets.views.setReturnValue({task: task, due: due});
    gadgets.views.close();
  });
});

$(document).ready(function() {
  $("#submit-btn").click(function() {
    var task = $("#task").val();
    var due = $("#due").val();
    if(task === "" && due === ""){
      $("#message").attr("style", "color: red;").text("Please enter valid task and due");
    } else if(task === ""){
      $("#message").attr("style", "color: red;").text("Please enter a valid task");
    } else if(due === ""){
      $("#message").attr("style", "color: red;").text("Please enter a valid due");
    } else {
      gadgets.views.setReturnValue({task: task, due: due});
      gadgets.views.close();
    }
  });
});

$(document).ready(function() {
  $("#button").click(function() {
    $("#table").append("<tr>
                          <td><input type="checkbox" name="vehicle" value="Bike"></td>
                          <td>thing</td>
                          <td>5/20</td>
                        </tr>");
  });
});

(function() {
  $(document).ready(function() {
    $.get(document.location + '/waiting', function(data) {
      return $("#my-turn").html(data);
    });
    $.get(document.location + '/playing', function(data) {
      return $("#games-playing").html(data);
    });
    $.get(document.location + '/lobbies', function(data) {
      return $("#my-waiting").html(data);
    });
    return $.get("/lobby", function(data) {
      return $("#all-waiting").html(data);
    });
  });
}).call(this);

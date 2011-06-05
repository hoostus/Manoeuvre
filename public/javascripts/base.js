(function() {
  $(document).ready(function() {
    $.get("/lobby", function(data) {
      return $("#all-waiting").html(data);
    });
    return $('#facebutt').click(function() {
      return openEasyOAuthBox('facebook', function(data) {
        return window.location.replace('/user');
      });
    });
  });
}).call(this);

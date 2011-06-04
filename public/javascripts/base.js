(function() {
  $(document).ready(function() {
    return $('#facebutt').click(function() {
      return openEasyOAuthBox('facebook', function(data) {
        return window.location.replace('/user');
      });
    });
  });
}).call(this);

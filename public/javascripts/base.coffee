$(document).ready ->
	$.get "/lobby", (data) ->
		$("#all-waiting").html data

	$('#facebutt').click ->
		openEasyOAuthBox 'facebook',  (data) ->
			# check for errors somehow?
			window.location.replace('/user')

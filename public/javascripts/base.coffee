$(document).ready ->
	$('#facebutt').click ->
		openEasyOAuthBox 'facebook',  (data) ->
			# check for errors somehow?
			window.location.replace('/user')

$(document).ready ->
	$.get document.location + '/waiting', (data) ->
		$("#my-turn").html data

	$.get document.location + '/playing', (data) ->
		$("#games-playing").html data

	$.get document.location + '/lobbies', (data) ->
		$("#my-waiting").html data

	$.get "/lobby", (data) ->
		$("#all-waiting").html data

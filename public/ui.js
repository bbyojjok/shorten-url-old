(function($){
	$('#btnCreateUrl').bind('click', function(){
		var url = $('#url').val().trim();
		var origin = location.origin;
		if (!url || url == '') {
			alert('주소를 넣어주세요');
			$('#url').focus();
			return false;
		}
		// use $.ajax
		$.ajax({
			method: 'POST',
			url: origin+'/api/create',
			contentType: 'application/json',
			data: JSON.stringify({ originalUrl: url }),
			dataType: 'json',
			success: function(data, textStatus, jqXHR){
				var shortUrl = data.shortUrl;
				$('#createdUrl').show().find('#shortUrl').text(shortUrl).attr('href', shortUrl);
			},
			error: function(jqXHR, textStatus, errorThrown){
				alert(jqXHR.responseText);
			}
		});
		/*
		// use fetch 
		fetch(origin+'/api/create', {
			method: 'POST',
			body: JSON.stringify({ originalUrl: url }),
			headers: { "Content-Type": "application/json" }
		}).then(function(res){
			if (!res.ok) { throw res }
			return res.json();
		}).then(function(data){
			var shortUrl = data.shortUrl;
			$('#createdUrl').show().find('#shortUrl').text(shortUrl).attr('href', shortUrl);
		}).catch(function(err){
			err.text().then(function(result){
				alert(result);
			});
		});
		*/
		return false;
	});
	$('#url').bind('keydown', function(e){
		if (e.keyCode == 13) $('#btnCreateUrl').trigger('click');
	});
	
	var clipboard = new ClipboardJS('#btnCopyUrl');
	clipboard.on('success', function(e) {
		e.clearSelection();
		alert('복사 완료\n' + e.text);
	});
})(jQuery);
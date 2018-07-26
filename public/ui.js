(function($){
	$('#btnCreateUrl').bind('click', function(){
		var url = $('#url').val().trim();
		var origin = location.origin;
		if (!url || url == '') {
			alert('주소를 넣어주세요');
			$('#url').focus();
			return false;
		}
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
		return false;
	});

	$('#btnCopyUrl').bind('click', function(){
		var target = $('#shortUrl').text();
		var $temp = $('<input>');
		$('body').append($temp);
		$temp.val(target).select();
		document.execCommand('copy');
		$temp.remove();
		alert('복사 완료\n' + target);
		return false;
	});

	$('#url').bind('keydown', function(e){
		if (e.keyCode == 13) $('#btnCreateUrl').trigger('click');
	});
})(jQuery);
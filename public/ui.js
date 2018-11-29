(function($) {
  $('#btnCreateUrl').bind('click', function(e) {
    var url = $('#url')
      .val()
      .trim();
    var origin = location.origin;
    if (!url || url == '') {
      alert('Paste link or url to input');
      $('#url').focus();
      return false;
    }

    // $.ajax
    $.ajax({
      method: 'POST',
      url: origin + '/api/create',
      contentType: 'application/json',
      data: JSON.stringify({ originalUrl: url }),
      dataType: 'json',
      success: function(data, textStatus, jqXHR) {
        var shortUrl = data[0].shortUrl;
        $('#createdUrl')
          .fadeIn(300)
          .find('#shortUrl')
          .attr('href', shortUrl)
          .find('> span')
          .text(shortUrl);
        if ($('#shortUrl').hasClass('copied')) {
          $('#shortUrl').removeClass('copied');
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert(jqXHR.responseText);
      }
    });

    /*
		// fetch
		fetch(origin+'/api/create', {
			method: 'POST',
			body: JSON.stringify({ originalUrl: url }),
			headers: { "Content-Type": "application/json" }
		}).then(function(res){
			if (!res.ok) { throw res }
			return res.json();
		}).then(function(data){
			var shortUrl = data[0].shortUrl;
      $('#createdUrl').show().find('#shortUrl').text(shortUrl).attr('href', shortUrl);
      if ($('#shortUrl').hasClass('copied')) {
        $('#shortUrl').removeClass('copied');
      }
		}).catch(function(err){
			err.text().then(function(result){
				alert(result);
			});
		});
		*/

    return false;
  });

  $('#url').bind('keydown', function(e) {
    if (e.keyCode === 13) $('#btnCreateUrl').trigger('click');
  });

  var clipboard = new ClipboardJS('#btnCopyUrl');
  clipboard.on('success', function(e) {
    e.clearSelection();
    $('#shortUrl').addClass('copied');
  });
  $('#btnCopyUrl').bind('click', function(e) {
    e.preventDefault();
    if ($('#shortUrl').hasClass('copied')) {
      $('#shortUrl').removeClass('copied');
    }
  });
})(jQuery);

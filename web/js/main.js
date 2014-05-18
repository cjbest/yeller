(function (App, yellsRef) {

	App.populator('intro', function(page){
		if (localStorage['name']) {
			page.querySelector('#nameInput').value = localStorage['name'];
		}

		App.form(page.querySelector('form'), function(formValues, unlock){
			localStorage['name'] = formValues.name || 'Anonymous';
			App.load('feed', {name: localStorage['name']});
			unlock();
		})
	});

	App.populator('feed', function (page, data) {

		var list = page.querySelector('.yell-list');
		var shareButton = page.querySelector('.share-button');
		var loadingElem = list.querySelector('.loading')
		var itemTemplate = list.querySelector('.yell');
		list.removeChild(itemTemplate);

		// lazy man's templating
		var latestYellsRef = yellsRef.endAt().limit(25);
		latestYellsRef.on('child_added', function(yellSnap){
			var item = itemTemplate.cloneNode(true);
			item.querySelector('.name').textContent = yellSnap.val().name;
			item.querySelector('.message').textContent = yellSnap.val().message;

			list.insertBefore(item, list.firstChild);
		});
		latestYellsRef.once('value', function(){
			if (loadingElem.parentNode) {
				loadingElem.parentNode.removeChild(loadingElem);
			}
		});

		// let App.js handle the form
		App.form(page.querySelector('form'), function(formData, unlock) {
			var message = formData.message && formData.message.trim();
			if (!message) {
				unlock();
				return;
			}
			yellsRef.push({
				name: data.name,
				message: message
			}, function(err) {
				unlock();
				if (!err) {
					page.querySelector('textarea').value = "";
				} else {
					// TODO
				}
			});
		});

		// share button
		if (!window.kik || !kik.send) {
			shareButton.parentNode.removeChild(shareButton);
		} else {
			shareButton.addEventListener('click', function(){
				kik.send({
					pic: '/img/icon.png',
					big: true
				});
			});
		}

		// textarea resizing
		var textarea = page.querySelector('textarea');
		textarea.addEventListener('input', function(event) {
			textarea.style.height = textarea.scrollHeight + 'px';  
		});
	});

	try {
		App.restore();
	} catch (ex) {
		App.load('intro');
	}
	
})(App, new Firebase('https://yelling.firebaseIO.com/posts'));

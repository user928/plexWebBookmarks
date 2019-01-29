chrome.extension.sendMessage({}, function(response) {

	const readyStateCheckInterval = setInterval(function() {

	// todo find better way to get plex classes?
	const isPlexClassLoaded = () => $('div').hasClass( "MetadataListPageContent-metadataListScroller-1uFgY");

	if (document.readyState === "complete" && isPlexClassLoaded()) {
		clearInterval(readyStateCheckInterval);

		// find current page we are on
		const currentPage =  $('a.Link-isSelected-IRm9u > div:last-child').text();
		console.log('___ currentPage is: ', currentPage);

		const indexGetter = () => {
			let indexes = [];
			let indexesAndText = Object.keys(localStorage).filter(item => item.includes('---Append__inputLink'));

			if (indexesAndText) {
				for(index of indexesAndText) {
					indexes.push(parseInt(index.split('---Append__inputLink')[0]))
				}
			}
			indexes.sort((a, b) => a - b);
			return indexes
		};

		let indexes = indexGetter();

		// show modal button
		$('.pageHeaderToolbar-toolbar-1lW-M').append('<button class="Append__buttonTopHeader">Add Bookmark</button>');

		// modal creation
		$(".Append__buttonTopHeader").on('click',
			function () {
			const plex = $('#plex');
				plex.append('<div class="Append__modal">' +
						'<input type="text" class="Append__inputLink" placeholder="Link to video" />' +
						'<input class="Append__inputText" type="text" placeholder="Text" />' +
						'<input class="Append__inputImage" type="text" placeholder="Link to image" />' +
						'<button class="Append__inputButtonAdd">Add Bookmark</button>' +
						'<button class="Append__inputButtonClose">Close (X)</button>' +
					'</div>');

				// increase counter if needed
				let newIndex = 0;
				if (indexes.length) {
					const lastIndex = indexes.pop();
					newIndex = lastIndex + 1;
				}

				// save values from inputs modal and destroy modal
				$('.Append__inputButtonAdd').on('click',  () => {

					// get data from inputs
					const Append__inputLink = $('.Append__inputLink').val();
					const Append__inputText = $('.Append__inputText').val();
					let Append__inputImage = $('.Append__inputImage').val();

					if (!Append__inputImage.length) {
						Append__inputImage = 'https://zhf1943ap1t4f26r11i05c7l-wpengine.netdna-ssl.com/wp-content/themes/plex/assets/img/plex-logo.svg'
					}

					// save data to localStorage
					localStorage.setItem(`${newIndex}---Append__inputLink`, Append__inputLink);
					localStorage.setItem(`${newIndex}---Append__inputText`, Append__inputText);
					localStorage.setItem(`${newIndex}---Append__inputImage`, Append__inputImage);

					// remove all thumbs from dom
					thumbsDomRemoval();

					// add thumbs to dom (with new thumb from modal)
					thumbsDomAppender();

					// destroy modal
					$('.Append__modal').remove();
				});

				// destroy modal on close btn
				$('.Append__inputButtonClose').on('click',  () => {
					$('.Append__modal').remove();
				});
			}
		);

		const thumbsDomRemoval = () => {
			indexes = indexGetter();

			for (index of indexes) {
				$(".Append__thumb").remove();
			}
		};

		// destroy clicked thumb on .Append__thumbDelete
		const destroyThumbOnClick = () => {
			$('.Append__thumbDelete').on('click', function () {
				const indexData = $(this).closest('.Append__thumb').attr('data-append-count');
				localStorage.removeItem(`${indexData}---Append__inputLink`);
				localStorage.removeItem(`${indexData}---Append__inputText`);
				localStorage.removeItem(`${indexData}---Append__inputImage`);
				$(this).closest('.Append__thumb').remove()
			})
		};

		// get data from local storage and append it to page
		const thumbsDomAppender = () => {
			if (indexes.length && isPlexClassLoaded()) {

				for (index of indexes) {
					const link = localStorage.getItem(`${index}---Append__inputLink`);
					const text = localStorage.getItem(`${index}---Append__inputText`);
					const image = localStorage.getItem(`${index}---Append__inputImage`);

					// append thumb div on page
					$('.MetadataListPageContent-metadataListScroller-1uFgY > div').append(`
					<div class="Append__thumb" data-append-count=${index}>
						<a href=${link} target="_blank">
							<img src=${image} alt="thumb image">
							<span>${text}</span>
						</a>
						<button class="Append__thumbDelete">Delete (X)</button>
					</div>`)
				}

				// set thumb width so it look like all plex thumbs
				const thumbWidth = $('.virtualized-cell-3KPHx').css('width');
				$(".Append__thumb").css("width", thumbWidth);

				// assign destroy fnc to thumbs
				destroyThumbOnClick();
			}
		};

		// append all thumbs on initial load
		thumbsDomAppender();

		// page change fnc
		const changePage = () => {

			// remove all thumbs from dom
			thumbsDomRemoval();

			// remove Add Bookmark button
			$('.Append__buttonTopHeader').remove();

			const pageChangeInterval = setInterval(function() {

				if (isPlexClassLoaded()) {
					clearInterval(pageChangeInterval);

					// add thumbs to dom
					thumbsDomAppender();

					// create Add Bookmark button
					$('.pageHeaderToolbar-toolbar-1lW-M').append('<button class="Append__buttonTopHeader">Add Bookmark</button>');

					// (attach event again) append all thumbs on page change (click on Movies or Tv Shows ...)
					$('[data-qa-id="sidebarLibrariesList"] a').on('click', () => {
						changePage();
					})
				}
			},100)
		};

		// append all thumbs on page change (click on Movies or Tv Shows ...)
		$('[data-qa-id="sidebarLibrariesList"] a').on('click', () => {
			changePage();
		})

		// END OF ALL ----------------------------------------------------------
	}
	}, 100);
});
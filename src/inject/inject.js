chrome.extension.sendMessage({}, function(response) {

	const readyStateCheckInterval = setInterval(function() {

		// check if main plex class is loaded (use jQuery Attribute Starts With Selector magic)
		const isPlexClassLoaded = () => $('[class^="MetadataListPageContent-metadataListScroller"]').is('div');

		if (document.readyState === "complete" && isPlexClassLoaded()) {
		clearInterval(readyStateCheckInterval);

		let oldPageUrl = window.location.hash;

		// find current page we are on (use jQuery jQuery [attribute*=value] Selector)
		const currentPage =  () => $("a[class*='Link-isSelected']").find('> div:last-child').text();

		const indexGetter = () => {
			let indexes = [];
			let indexesAndText = Object.keys(localStorage).filter(item => item.includes(`${currentPage()}__Append__inputLink`));

			if (indexesAndText) {
				for(index of indexesAndText) {
					indexes.push(parseInt(index.split(`${currentPage()}__Append__inputLink__`)[1]))
				}
			}
			indexes.sort((a, b) => a - b);
			return indexes
		};

		let indexes = indexGetter();

		// create Add Bookmark button
		const createAddBookmarkBtn = () => $("[class*='pageHeaderToolbar-toolbar-']").append('<button class="Append__buttonTopHeader">Add Bookmark</button>');
		createAddBookmarkBtn();

		// create Add Bookmark modal
		const createAddBookmarkModal = () => {

			const plex = $('#plex');
				plex.append(
				'<div class="Append__modal">' +
					'<input type="text" class="Append__inputLink" placeholder="Link to video" />' +
					'<input class="Append__inputText" type="text" placeholder="Text" />' +
					'<input class="Append__inputImage" type="text" placeholder="Link to image" />' +
					'<button class="Append__inputButtonAdd">Add Bookmark</button>' +
					'<button class="Append__inputButtonClose">Close (X)</button>' +
				'</div>');

			// increase counter if needed
			let newIndex = 0;
			indexes = indexGetter();
			if (indexes.length) {
				const lastIndex = indexes.pop();
				newIndex = lastIndex + 1;
			}

			// save values from modal inputs and destroy modal
			$('.Append__inputButtonAdd').on('click',  () => {

				// get data from inputs
				const Append__inputLink = $('.Append__inputLink').val();
				const Append__inputText = $('.Append__inputText').val();
				let Append__inputImage = $('.Append__inputImage').val();

				if (!Append__inputImage.length) {
					Append__inputImage = 'https://zhf1943ap1t4f26r11i05c7l-wpengine.netdna-ssl.com/wp-content/themes/plex/assets/img/plex-logo.svg'
				}

				// save data to localStorage
				localStorage.setItem(`${currentPage()}__Append__inputLink__${newIndex}`, Append__inputLink);
				localStorage.setItem(`${currentPage()}__Append__inputText__${newIndex}`, Append__inputText);
				localStorage.setItem(`${currentPage()}__Append__inputImage__${newIndex}`, Append__inputImage);

				// remove all thumbs from dom
				thumbsDomRemoval();

				// add thumbs to dom (with new thumb from modal)
				thumbsDomAppender();

				// destroy modal when everything is done
				$('.Append__modal').remove();
			});

			// destroy modal on close btn
			$('.Append__inputButtonClose').on('click',  () => {
				$('.Append__modal').remove();
			});
		};

		$(".Append__buttonTopHeader").on('click',
			() => createAddBookmarkModal()
		);

		// remove all thumbs from page
		const thumbsDomRemoval = () => {
			indexes = indexGetter();

			for (index of indexes) {
				$(".Append__thumb").remove();
			}
		};

		// destroy clicked thumb on .Append__thumbDelete
		const destroyThisThumbOnClick = () => {
			$('.Append__thumbDelete').on('click', function () {

				const indexData = $(this).closest('.Append__thumb').attr('data-append-count');
				localStorage.removeItem(`${currentPage()}__Append__inputLink__${indexData}`);
				localStorage.removeItem(`${currentPage()}__Append__inputText__${indexData}`);
				localStorage.removeItem(`${currentPage()}__Append__inputImage__${indexData}`);
				$(this).closest('.Append__thumb').remove()
			})
		};

		// get data from local storage and append it to page
		const thumbsDomAppender = () => {
			indexes = indexGetter();
			if (indexes.length) {

				for (index of indexes) {
					const link = localStorage.getItem(`${currentPage()}__Append__inputLink__${index}`);
					const text = localStorage.getItem(`${currentPage()}__Append__inputText__${index}`);
					const image = localStorage.getItem(`${currentPage()}__Append__inputImage__${index}`);

					// append thumb div on page
					$("[class*='MetadataListPageContent-metadataListScroller-'] > div").append(`
					<div class="Append__thumb" data-append-count=${index}>
						<a href=${link} target="_blank">
							<img src=${image} alt="thumb image">
							<span>${text}</span>
						</a>
						<button class="Append__thumbDelete">Delete (X)</button>
					</div>`)
				}

				// set thumb width so it look like all plex thumbs
				const thumbWidth = $("[class*='virtualized-cell-']").css('width');
				$(".Append__thumb").css("width", thumbWidth);

				// assign destroy fnc to thumbs
				destroyThisThumbOnClick();
			}
		};

		// append all thumbs on initial load
		thumbsDomAppender();

		// page change fnc
		const onPageChange = () => {

			// remove all thumbs from dom
			thumbsDomRemoval();

			// remove Add Bookmark button
			$('.Append__buttonTopHeader').remove();

			let pageChangeIntervalCounter = 0;

			const pageChangeInterval = setInterval(function() {

				// jQuery need find it again duuno why...
				const sidebarLibrariesLinksAgainYesAgain = $("[data-qa-id^='sidebarLibrariesList'] a");

				// clear pageChangeInterval after some time (if we are on some other plex page...)
				pageChangeIntervalCounter += 1;
				if (pageChangeIntervalCounter >= 100) {
					clearInterval(pageChangeInterval);
					// attach event again onPageChange
					sidebarLibrariesLinksAgainYesAgain.off();
					sidebarLibrariesLinksAgainYesAgain.on('click', () => {
						onPageChange();
					})
				}

				if (isPlexClassLoaded()) {
					clearInterval(pageChangeInterval);
					pageChangeIntervalCounter = 0; // clear pageChangeInterval after some time

					// append all thumbs
					thumbsDomAppender();

					// create Add Bookmark button (again)
					createAddBookmarkBtn();

					// create add bookmark modal and attach event (again)
					$(".Append__buttonTopHeader").on('click',
						() => createAddBookmarkModal()
					);

					// attach event again onPageChange
					sidebarLibrariesLinksAgainYesAgain.off();
					sidebarLibrariesLinksAgainYesAgain.on('click', () => {
						onPageChange();
					})
				}
			},100);
		};

		// append all thumbs on page change (click on Movies or Tv Shows library ...)
		const sidebarLibrariesLinks = $("[data-qa-id^='sidebarLibrariesList'] a");
		sidebarLibrariesLinks.on('click', () => {
			onPageChange();
		});

		// TODO: FIND BETTER WAY TO HANDLE THIS !!!
		// keep event alive if user go to different page and return to library page
		setInterval( () => {
			const newPageUrl = window.location.hash;

			if (oldPageUrl !== newPageUrl) {
				oldPageUrl = newPageUrl;

				// append all thumbs on page change (click on Movies or Tv Shows library ...)
				const sidebarLibrariesLinksAgain = $("[data-qa-id^='sidebarLibrariesList'] a");
				sidebarLibrariesLinksAgain.off();
				sidebarLibrariesLinksAgain.on('click', () => {
					onPageChange();
				});
			}

		}, 2000)


		// END OF ALL ----------------------------------------------------------
	}
	}, 100);
});

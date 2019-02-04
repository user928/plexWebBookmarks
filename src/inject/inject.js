chrome.extension.sendMessage({}, (response) => {

	const readyStateCheckInterval = setInterval(() => {

		// check if main plex class is loaded (use jQuery Attribute Starts With Selector)
		const isPlexClassLoaded = () => $('[class^="MetadataListPageContent-metadataListScroller"]').is('div');

		if (document.readyState === "complete" && isPlexClassLoaded()) {
		clearInterval(readyStateCheckInterval);

		let oldPageUrl = window.location.hash;

		// create div to hold all thumbs
		const AppendContainerCreation = () => {
			$('[class^="MetadataListPageContent-metadataListScroller"]').append('<div class="AppendContainer"></div>')
		};

		// find current page we are on (use jQuery [attribute*=value] Selector)
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
		const createAddBookmarkModal = (editIndex) => {

			const plex = $('#plex');
				plex.append(
				'<div class="Append__modal">' +
					'<div class="Append__modalInner">' +

						'<span>Link to video</span>' +
						'<input type="text" class="Append__inputLink" placeholder="Link to video" />' +

						'<span>Text for video</span>' +
						'<input class="Append__inputText" type="text" placeholder="Text for video" />' +

						'<span>Link to image</span>' +
						'<input class="Append__inputImage" type="text" placeholder="Link to image" />' +

						'<button class="Append__inputButtonAdd">Save Bookmark</button>' +
						'<button class="Append__inputButtonClose">Close (X)</button>' +

						'<div class="Append__exportButtons">' +
							'<a href="#" class="Append__exportButtonExport">Export bookmarks</a>' +
							'<button class="Append__exportButtonImportVisible">Import bookmarks</button>' +
							'<input type="file" class="Append__exportButtonImportHidden" />' +
						'</div>' +

					'</div>' +
				'</div>');

			// increase counter if needed
			let newIndex = 0;
			indexes = indexGetter();
			if (indexes.length) {
				const lastIndex = indexes.pop();
				newIndex = lastIndex + 1;
			}

			// if clicked on edit button
			if (editIndex) {
				const editLink = localStorage.getItem(`${currentPage()}__Append__inputLink__${editIndex}`);
				const editText = localStorage.getItem(`${currentPage()}__Append__inputText__${editIndex}`);
				const editImage = localStorage.getItem(`${currentPage()}__Append__inputImage__${editIndex}`);

				$('.Append__inputLink').val(editLink);
				$('.Append__inputText').val(editText);
				$('.Append__inputImage').val(editImage);
			}

			// save values from modal inputs and destroy modal
			$('.Append__inputButtonAdd').on('click',  () => {

				// get data from inputs
				let Append__inputLink = $('.Append__inputLink').val();
				let Append__inputText = $('.Append__inputText').val();
				let Append__inputImage = $('.Append__inputImage').val();

				// default link protocol
				if (Append__inputLink.startsWith('www')) {
					Append__inputLink = `https://${Append__inputLink}`;
				}

				// default text
				if (!Append__inputText.length) {
					Append__inputText = `${currentPage()} ${newIndex}`
				}

				// default image
				if (!Append__inputImage.length) {
					Append__inputImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPUAAAF0CAMAAADM9I+eAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2Mjg1QjVGRDFFRkQxMUU5OEEzNkNDNkY3QjhGNzIzNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2Mjg1QjVGRTFFRkQxMUU5OEEzNkNDNkY3QjhGNzIzNiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjYyODVCNUZCMUVGRDExRTk4QTM2Q0M2RjdCOEY3MjM2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjYyODVCNUZDMUVGRDExRTk4QTM2Q0M2RjdCOEY3MjM2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+NUQSxAAAAYBQTFRFpaWlzH0Z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'
				}

				// save data to localStorage
				try {
					// if clicked on edit button
					if (editIndex){
						localStorage.setItem(`${currentPage()}__Append__inputLink__${editIndex}`, Append__inputLink);
						localStorage.setItem(`${currentPage()}__Append__inputText__${editIndex}`, Append__inputText);
						localStorage.setItem(`${currentPage()}__Append__inputImage__${editIndex}`, Append__inputImage);
					} else {
						localStorage.setItem(`${currentPage()}__Append__inputLink__${newIndex}`, Append__inputLink);
						localStorage.setItem(`${currentPage()}__Append__inputText__${newIndex}`, Append__inputText);
						localStorage.setItem(`${currentPage()}__Append__inputImage__${newIndex}`, Append__inputImage);
					}
				// if local storage is full show error
				} catch (e) {
					if (e.name === 'QUOTA_EXCEEDED_ERR') {
						alert("Memory is full. Cannot save. You need to delete a few items first.");
					} else {
						alert("Something went wrong? Try again later or try to delete a few items?")
					}
				}

				// remove all thumbs from dom
				thumbsDomRemoval();

				// add thumbs to dom (with new thumb from modal)
				thumbsDomAppender();

				// destroy modal when everything is done
				$('.Append__modal').remove();
			});

			// export data from local storage to json file
			$('.Append__exportButtonExport').on('click', function () {

				let lsData =  [];
				for (let key in localStorage) {
					if (localStorage.hasOwnProperty(key) && key.includes('__Append__')) {
						lsData.push( [key, localStorage[key]] )
					}
				}

				const json = JSON.stringify(lsData);
				const blob = new Blob([json], {type: "application/json"});
				const exportUrl  = URL.createObjectURL(blob);

				$(this).attr('download', 'plex-bookmarks.json');
				$(this).attr('href', exportUrl);
			});

			// import data from json file to local storage
			$('.Append__exportButtonImportHidden').on('change',  function () {
				if (confirm("Import will delete all current bookmarks. Do you wish to proceed ?")) {
					const file = this.files[0];
					const fileType = /json.*/;

					// remove all thumbs from dom
					thumbsDomRemoval();
					// remove all thumbs from localStorage
					for (let key in localStorage) {
						if (localStorage.hasOwnProperty(key) && key.includes('__Append__')) {
							localStorage.removeItem(key);
						}
					}

					if (file.type.match(fileType)) {
						const reader = new FileReader();

						reader.onload = function() {
							const result =  JSON.parse(reader.result);
							for (let item in result) {
								if (result.hasOwnProperty(item)) {
									localStorage.setItem(result[item][0], result[item][1]);
								}
							}

							// append all thumbs after data is loaded
							thumbsDomAppender();
						};

						console.log("imported data", reader.readAsText(file));

						// destroy modal when everything is done
						$('.Append__modal').remove();

					} else {
						alert('Import failed, please try again');
					}
				}
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

				if (confirm("Are you sure you want to delete this item ?")) {
					$(this).closest('.Append__thumb').remove()
				}
			})
		};

		// edit clicked thumb on .Append__thumbEdit
		const editThisThumbOnClick = () => {
			$('.Append__thumbEdit').on('click', function () {
				const indexData = $(this).closest('.Append__thumb').attr('data-append-count');
				createAddBookmarkModal(indexData);
			})
		};

		// get data from local storage and append it to page
		const thumbsDomAppender = () => {
			indexes = indexGetter();
			if (indexes.length) {

				// remove div which hold all thumbs
				$('.AppendContainer').remove();

				// create div to hold all thumbs
				AppendContainerCreation();

				for (index of indexes) {
					const link = localStorage.getItem(`${currentPage()}__Append__inputLink__${index}`);
					const text = localStorage.getItem(`${currentPage()}__Append__inputText__${index}`);
					const image = localStorage.getItem(`${currentPage()}__Append__inputImage__${index}`);

					// append thumb div on page
					$('.AppendContainer').append(`
					<div class="Append__thumb" data-append-count=${index}>
						<button class="Append__thumbEdit">Edit</button>
						<a href=${link} target="_blank">
							<div class="Append__thumbImage" style="background-image: url('${image}') "></div>
							<span>${text}</span>
						</a>
						<button class="Append__thumbDelete">Delete</button>
					</div>`);
				}

				// set thumb width and height so it look like all other plex thumbs
				const getPlexThumbCss = $("[class*='virtualized-cell-'] > div");
				const appendThumb = $(".Append__thumb");
				appendThumb.css("width", getPlexThumbCss.css('width'));
				appendThumb.css("height", getPlexThumbCss.css('height'));

				// assign destroy fnc to thumbs
				destroyThisThumbOnClick();

				// assign edit fnc to thumbs
				editThisThumbOnClick();
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

			const pageChangeInterval = setInterval(() => {

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

		// TODO: FIND BETTER WAY TO HANDLE PAGE CHANGE !!!
		// this way we keep event alive if user go to different page and return to library page
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

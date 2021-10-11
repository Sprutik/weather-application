// ====Work with API ====
{
	// Change date in header and footer
	const date = new Date();

	document.querySelector('.date').textContent =
		date.getDate() +
		' ' +
		new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date) +
		' ' +
		date.getFullYear();
	document.querySelector('.year').textContent = date.getFullYear();

	// Night mode
	// if 'true' - night mode activeted

	const night = date.getHours() >= 21 || date.getHours() < 6 ? true : false;
	if (night) {
		document.querySelector('.section-header').style.background =
			'url(img/night.png) center/cover';
		document.querySelector('.section-header-search-btn').classList.add('night');
	}

	//  === Popular cities block ===

	// Generate most popular cities block
	const cities = ['New York', 'London', 'Dubai', 'Paris'];
	const citiesBlock = document.querySelector('.section-popular-cities-cards');

	function searchCityByName(name = 'Kyiv', country = '') {
		return fetch(
			`http://api.openweathermap.org/data/2.5/weather?q=${name},${country}&units=metric&appid=1d960279e776d3ca9de5fa3660aa3a89`
		)
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					const e = new Error('Cant get data');
					throw e;
				}
			})
			.catch((reject) => {
				console.log(reject);
				cleanWidget();
			});
	}

	cities.forEach((name) => {
		const card = document.createElement('div');
		card.classList.add('card');
		card.innerHTML = `<p class="city-name">${name}</p>`;

		// the card gets img reffering to name without any white space
		card.style.background = `url(img/cities/${name
			.toLocaleLowerCase()
			.replace(/\s+/g, '')}.jpg)`;
		card.style.backgroundSize = 'contain';

		card.addEventListener('click', () => {
			searchCityByName(name).then((response) => changeWeather(response));

			// scroll to the top after click
			let timer = setInterval(goToTop, 1);
			function goToTop() {
				if (window.pageYOffset >= 100) {
					window.scrollTo(0, window.pageYOffset - 7);
				} else {
					clearInterval(timer);
				}
			}
		});

		citiesBlock.append(card);
	});

	//  === /Popular cities block ===

	//=== Header block ===

	// Initialization
	searchCityByName('Kyiv', 'UA').then((promise) => changeWeather(promise));

	const dropDownList = document.querySelector('.section-header-dropdown');

	// Last visited cities
	function drawLastVisitedList(cityName) {
		const lastVisited = JSON.parse(localStorage.getItem('lastVisited')) || [];
		if (cityName) {
			if (lastVisited.includes(cityName)) {
				lastVisited.splice(lastVisited.indexOf(cityName), 1);
				lastVisited.push(cityName);
			} else {
				if (lastVisited.length >= 5) {
					lastVisited.shift();
				}
				lastVisited.push(cityName);
			}
		}

		// draw block
		if (lastVisited.length > 0) {
			dropDownList.classList.remove('last-visit-disable');
			const lastVisitedList = document.querySelector(
				'.section-header-last-visited'
			);
			lastVisitedList.style.visibility = 'visible';
			// check night mode
			if (night) {
				lastVisitedList.classList.add('night');
			}
			lastVisitedList.innerHTML = '';
			lastVisited.forEach((city) => {
				const lastVisitedListItem = document.createElement('span');
				lastVisitedListItem.innerHTML = city;

				//add event to change current widget
				lastVisitedListItem.addEventListener('click', () => {
					searchCityByName(city).then((response) => changeWeather(response));
				});
				lastVisitedList.append(lastVisitedListItem);
			});
		}
		localStorage.setItem('lastVisited', JSON.stringify(lastVisited));
	}
	drawLastVisitedList();

	// Get data from Search
	const searchBtn = document.querySelector('.section-header-search-btn');
	searchBtn.addEventListener('click', (e) => {
		e.preventDefault();
		const inputValue = document.querySelector(
			'.section-header-search-input'
		).value;
		if (inputValue) {
			fetch(
				`http://api.openweathermap.org/data/2.5/find?q=${inputValue}&units=metric&appid=1d960279e776d3ca9de5fa3660aa3a89`
			)
				.then((response) => {
					if (response.ok) {
						return response.json();
					} else {
						const e = new Error('Cant get data');
						throw e;
					}
				})
				.then((response) => {
					drawDropdownList(response.list);
				})
				.catch((reject) => {
					console.log(reject);
					// cleanWidget();
				});
		}
	});

	// Fill and toggle the drop down list
	function drawDropdownList(list) {
		dropDownList.innerHTML = '';
		dropDownList.style.display = 'block';

		// Drow items in list
		if (list.length == 0) {
			dropDownList.innerHTML =
				'<div class="section-header-dropdown-item not-found"><p>City not found, please try to change your search query</p></div>';
		} else {
			list.forEach((element) => {
				const item = document.createElement('div');
				item.classList.add(`section-header-dropdown-item`);
				if (night) {
					item.classList.add('night');
				}

				// Use --- new Intl.DisplayNames(['en'], { type: 'region' }) --- to transfort country code to full name
				const cityName = `${element.name}, ${new Intl.DisplayNames(['en'], {
					type: 'region'
				}).of(element.sys.country)}`;
				item.innerHTML = cityName;
				item.addEventListener('click', () => {
					dropDownList.style.display = 'none';
					changeWeather(element);
					drawLastVisitedList(cityName);
				});

				dropDownList.append(item);
			});
		}
	}

	// add event to close drop list

	document.addEventListener('click', (e) => {
		if (e.target != dropDownList) {
			dropDownList.style.display = 'none';
		}
	});

	document.addEventListener('keydown', (e) => {
		if (e.code === 'Escape') {
			dropDownList.style.display = 'none';
		}
	});

	// Change weather details widget
	function changeWeather(element) {
		//'weather[0]' - The first weather condition in API respond is primary
		document.querySelector('.weather-icon').src = `img/weather-icons/day/${
			element.weather[0].icon.substring(0, 2) + (night ? 'n' : 'd')
		}.png`;
		document.querySelector('.weather-name').textContent =
			element.weather[0].main;
		document.querySelector('.weather-conditions').textContent =
			element.weather[0].description;
		document.querySelector('.location').textContent = `${
			element.name
		}, ${new Intl.DisplayNames(['en'], {
			type: 'region'
		}).of(element.sys.country)}`;
		document.querySelector('.temperature').textContent =
			Math.floor(element.main.temp) + '°C';
		document.querySelector('.max-temperature').textContent =
			Math.floor(element.main.temp_max) + '°C';
		document.querySelector('.min-temperature').textContent =
			Math.floor(element.main.temp_min) + '°C';
	}

	//Alert about connecting problems
	function cleanWidget() {
		document.querySelector('.section-header-weather-details').innerHTML =
			'<div class="error-message"><h1>Connecting problems...</h1></div>';
	}

	//=== /Header block ===
}
// // ====/Work with API ====

// ====Animation for FAQ block====
{
	const buttons = document.querySelectorAll('.faq-item__trigger');

	buttons.forEach((item) =>
		item.addEventListener('click', () => {
			item.querySelector('i').classList.toggle('arrow-up');

			const content = item.nextElementSibling;

			if (content.style.maxHeight) {
				content.style.maxHeight = null;
			} else {
				content.style.maxHeight = content.scrollHeight + 'px';
			}
		})
	);
}
// ==== /Animation for FAQ block====

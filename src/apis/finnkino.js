const url = 'https://www.finnkino.fi/xml/';

// noudetaan api tiedot osoitteesta
//jos haluatte muokana niin endpoint on vaan parametri joka määrittelee mitä tietoa haetaan esim TheatreAreas tai joku muu apista XML tiedostosta
//DOMPareser on pakko olla jotta saadaan xml:stä tiedot kaivettua
async function fetchAndParse(endpoint) {
  try {
    const response = await fetch(url + endpoint);
    const xmlText = await response.text();
    const parser = new DOMParser(); 
    return parser.parseFromString(xmlText, 'text/xml');
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

// haetaan  teattereiden paikat
//funkitot pitää luoda jokaiselle endpointille ja ne voitaisi exportata yksittäisinä jos halutaan käyttää muissa tiedostoissa esim. export { loadTheatreAreas, loadMoviesForTheatre };
async function loadTheatreAreas() {
  const xml = await fetchAndParse('TheatreAreas');
  if (!xml) return;

  const theatreSelect = document.getElementById('theatreSelect');
  theatreSelect.innerHTML = '';

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Select theatre area --';
  theatreSelect.appendChild(defaultOption);

  const areas = xml.getElementsByTagName('TheatreArea');
  Array.from(areas).forEach((area) => {
    const id = area.getElementsByTagName('ID')[0].textContent;
    const name = area.getElementsByTagName('Name')[0].textContent;

    const option = document.createElement('option');
    option.value = id;
    option.textContent = name;
    theatreSelect.appendChild(option);
  });
}

// areaidn mukaan näytetään elokuva listaukset ja tämän jälkeen tiedot kute title year pituus ja kuva
async function loadMoviesForTheatre(areaId) {
  if (!areaId) {
    document.getElementById('movieList').innerHTML = '<p>Please select a theatre.</p>';
    return;
  }

  const xml = await fetchAndParse(`Schedule/?area=${areaId}`);
  if (!xml) return;
/* huom movieList pitää olla html sivulla että saadaan tiedot sinne näkyviin, minulla oli testissä: 
  <label for="theatreSelect">Select theatre area:</label>
  <select id="theatreSelect">
    <option value="">Loading theatres...</option>
  </select>
   <div id="movieList">
    
  </div>
    <script type="module" src="./testi.js"></script> */
  const movieListDiv = document.getElementById('movieList');
  movieListDiv.innerHTML = '';

  const shows = xml.getElementsByTagName('Show');
  if (shows.length === 0) {
    movieListDiv.innerHTML = '<p>No movies found for this theatre.</p>';
    return;
  }

  Array.from(shows).forEach((show) => {
    const title = show.getElementsByTagName('Title')[0]?.textContent;
    const year = show.getElementsByTagName('ProductionYear')[0]?.textContent || 'N/A';
    const length = show.getElementsByTagName('LengthInMinutes')[0]?.textContent || 'N/A';
    const theatre = show.getElementsByTagName('Theatre')[0]?.textContent || '';
    const image =
      show.getElementsByTagName('EventMediumImagePortrait')[0]?.textContent ||
      show.getElementsByTagName('EventSmallImagePortrait')[0]?.textContent;

    const movieDiv = document.createElement('div');
    movieDiv.classList.add('movie');

    if (image) {
      const img = document.createElement('img');
      img.src = image;
      img.alt = title;
      movieDiv.appendChild(img);
    }

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('movie-info');

    const titleEl = document.createElement('h2');
    titleEl.textContent = title;
    infoDiv.appendChild(titleEl);

    const metaEl = document.createElement('p');
    metaEl.textContent = `Year: ${year}, Length: ${length} min, Theatre: ${theatre}`;
    infoDiv.appendChild(metaEl);

    movieDiv.appendChild(infoDiv);
    movieListDiv.appendChild(movieDiv);
  });
}

// Event listener odottaa paikan valintaa
document.getElementById('theatreSelect').addEventListener('change', (e) => {
  loadMoviesForTheatre(e.target.value);
});

// sivun ladattaessa heataan teatterit
//niille sivuille mihin tullaan exporttaamaan eri funktioita niin muista exportata haluttu funktio ja kutsia sitä siellä missä käytetään
loadTheatreAreas();

/*const AREAS = url + 'TheatreAreas'
const LANGUAGES = url + 'Languages'
const SCHEDULE_DATES = url + 'ScheduleDates'
const SCHEDULE = url + 'Schedule'
const EVENTS = url + 'Events'
const NEWS = url + 'News'
const NEWS_CATEGORIES = url + 'NewsCategories'*/
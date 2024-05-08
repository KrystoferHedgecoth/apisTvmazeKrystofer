"use strict";

// Define a default image URL for shows without an image provided by the API
const MISSING_IMAGE_URL = "https://tinyurl.com/missing-tv";
// Set the base URL for the TVMaze API
const TVMAZE_API_URL = "http://api.tvmaze.com/";

// Select DOM elements for shows list, episodes list, episodes area, and search form
const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

/**
 * Queries the TVMaze API for TV shows matching a given search term.
 * Processes the API response to extract and return an array of show objects,
 * each containing the show's ID, name, summary, image URL, and network name.
 * If a show's image URL is not provided by the API, a default image URL is used.
 * Returns a promise that resolves to the array of show objects.
 */
async function getShowsByTerm(term) {
    const response = await axios({
        baseURL: TVMAZE_API_URL,
        url: "search/shows",
        method: "GET",
        params: {
            q: term,
        },
    });

    return response.data.map(result => {
        const show = result.show;
        return {
            id: show.id,
            name: show.name,
            summary: show.summary,
            image: show.image ? show.image.medium : MISSING_IMAGE_URL,
            network: show.network ? show.network.name : 'Unknown',
        };
    });
}

/**
 * Generates and returns an HTML string for a single show, including its details and a button to fetch its episodes.
 * This function is used to create a DOM element for each show in the list.
 */
function generateShowHTML(show) {
    return `
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
            <div class="media">
                <img src="${show.image}" alt="${show.name}" class="w-25 me-3">
                <div class="media-body">
                    <h5 class="text-primary">${show.name}</h5>
                    <div><small>${show.summary}</small></div>
                    <button class="btn btn-outline-light btn-sm Show-getEpisodes">
                        Episodes
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Clears the current list of shows and repopulates it with the provided array of shows.
 * Each show is represented as a DOM element created by the generateShowHTML function.
 */
function populateShows(shows) {
    $showsList.empty();

    for (let show of shows) {
        const $show = $(generateShowHTML(show));
        $showsList.append($show);
    }
}

/**
 * Handles the submission of the search form. Fetches shows based on the search term,
 * hides the episodes area, and displays the fetched shows.
 */
async function searchForShowAndDisplay() {
 const term = $("#searchForm-term").val();
 const shows = await getShowsByTerm(term);

 $episodesArea.hide();
 populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
 evt.preventDefault();
 await searchForShowAndDisplay();
});

/**
 * Fetches episodes for a given show ID.
 * Returns a promise that resolves to an array of episode objects, each containing:
 * {id, name, season, number}.
 */
async function getEpisodesOfShow(id) {
 const response = await axios({
    baseURL: TVMAZE_API_URL,
    url: `shows/${id}/episodes`,
    method: "GET",
 });

 return response.data.map(e => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number,
 }));
}

/**
 * Clears the current list of episodes and repopulates it with the provided array of episodes.
 * Each episode is represented as a list item with its details such as name, season and episode number.
 */
function populateEpisodes(episodes) {
    $episodesList.empty();
    let episodesHTML = '';
    for (let episode of episodes) {
        let episodeClass = `episode-${episode.season}-${episode.number}`;
        let episodeItem = `
            <li class="${episodeClass}">
                ${episode.name}
                (Season ${episode.season}, Episode ${episode.number})
            </li>
        `;
        episodesHTML += episodeItem;
    }
    $episodesList.html(episodesHTML);
    $episodesArea.show();
}

// Attach the click event handler to the "Episodes" button for each show
$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);

// Fetches and displays episodes for a show, and then scrolls the viewport down to meet them.
async function getEpisodesAndDisplay(evt) {
 const showId = $(evt.target).closest(".Show").data("show-id");

 // Fetch the episodes for the show and update the UI
 const episodes = await getEpisodesOfShow(showId);
 populateEpisodes(episodes);

 // After updating the UI, smoothly scroll to the episodes list
 $episodesList[0].scrollIntoView({ behavior: 'smooth' });
}
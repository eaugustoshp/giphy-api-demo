const API_URL = 'https://api.giphy.com/v1/gifs/';
const API_KEY = 'aABOCgxWJ7n7TPbR5kxAeRt79ezGBqOg';
const limit = 20; // Gifs to show per page

let offset = 0; // Flag for offset
let keySearch = ""; // Store search word
let isLoading = false; // Flag for lock call from API while it's loading

// Function to trigger app init
function initialize() {
    // Loading last searchs
    loadSearches();

    // Add listener to the button
    document.getElementById('searchGif').addEventListener('click', searchGifs, true);

    // Add listener for scroll end of page
    window.addEventListener('scroll', endOfPage);

    // Load initial gifs
    loadInitialGifs();

}

// Function for get last searches from local storage
async function loadSearches(){
    if (localStorage.getItem('last-searches') !== null) {
        document.getElementById('recent-searches').innerHTML = ``;
        let keywords = await JSON.parse(localStorage.getItem('last-searches'));
        Promise.all(keywords.map((keyword) => {
            document.getElementById('recent-searches').innerHTML += `<span class="key-last-search">${keyword}</span>`;
        })).then(() => {
            document.querySelectorAll('.key-last-search').forEach(item => {
                item.addEventListener('click', searchFromPast, true);
            });
        });
    } else {
        document.getElementById('recent-searches').innerHTML = `<em>Aún no has buscado nada :(</em>`;
        console.log(`No hay búsquedas`);
    }
}

// Function for add and manage new searches to local storage
async function storeSearches(word){
    if (localStorage.getItem('last-searches') !== null) {
        
        let keywords = await JSON.parse(localStorage.getItem('last-searches'));
        if(!keywords.includes(word)){
            if(keywords.length == 3){
                keywords.unshift(word);
                keywords.pop();
            } else {
                keywords.unshift(word);
            }
            localStorage.setItem('last-searches', JSON.stringify(keywords));
        }

    } else {
        let keywords = [];
        keywords.push(word);
        localStorage.setItem('last-searches', JSON.stringify(keywords));
    }
    loadSearches();
}

// Function for load initial GIFs on homepage
async function loadInitialGifs(){
    let rawGifs = await fetch(API_URL + `trending?api_key=${API_KEY}&limit=${limit}&offset=${offset}`);
    let jsonGifs = await rawGifs.json();

    renderGifs(jsonGifs);
}

// Function for search GIFs or resume from last search
async function searchGifs(e = null){
    if(e != null){
        // Coming from new search
        document.getElementById('gifs-area').innerHTML = '';
        offset = 0;
        keySearch = document.getElementById('keyword-gif').value;
        storeSearches(keySearch);
    }

    let rawGifs = await fetch(API_URL + `search?api_key=${API_KEY}&limit=${limit}&offset=${offset}&q=${keySearch}`);
    let jsonGifs = await rawGifs.json();

    renderGifs(jsonGifs);
}

// Function for render GIFs on the page
function renderGifs(jsonGifs){
    if(jsonGifs.pagination.count > 0){
        Promise.all(jsonGifs.data.map(el => {
            document.getElementById('gifs-area').innerHTML += `
            <div class="col col-md-3 col-sm-6 col-12 mt-4">
                <img src="${el.images.downsized_large.url}" alt="">
            </div>
            `;
        })).then(() => {
            offset += limit;
            isLoading = false;
        });
    } else {
        document.getElementById('gifs-area').innerHTML = '<span class="text-center mt-5">¡Ups! Tu búsqueda no ha retornado resultados :(</span>';
        console.log("no hay resultados");
    }
}

// Function for detect end of page (Infinite scroll)
function endOfPage(){
    const {
        scrollTop,
        scrollHeight,
        clientHeight
    } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 50 && isLoading == false){
        isLoading = true;
        if(keySearch == ""){
            // Load GIFs trending
            loadInitialGifs();
        } else {
            // Load GIFs from search
            searchGifs();
        }
    }
}

// Function for search using last 3 searches
function searchFromPast(e){
    document.getElementById('keyword-gif').value = e.target.innerText;
    let btnBuscar = document.getElementById('searchGif');
    btnBuscar.click();
}

// Initial call
initialize();
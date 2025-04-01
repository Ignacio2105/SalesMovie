//Uso de Axios
const API = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
    params: {
        'api_key': API_KEY,
        'language': localStorage.getItem('selectedLanguage') || navigator.language || 'es-ES',
    }
});

// Configurar selector de idioma
const languageSelect = document.getElementById('languageSelect');

// Establecer idioma inicial
const savedLanguage = localStorage.getItem('selectedLanguage');
if (savedLanguage) {
    languageSelect.value = savedLanguage;
} else {
    const browserLang = navigator.language;
    languageSelect.value = browserLang.startsWith('es') ? 'es-ES' : 
    browserLang.startsWith('fr') ? 'fr-FR' : 'en-US';
}

// Manejar cambio de idioma
languageSelect.addEventListener('change', async (e) => {
    const newLanguage = e.target.value;
    localStorage.setItem('selectedLanguage', newLanguage);
    API.defaults.params.language = newLanguage;
    await reloadCurrentView();
});

// Recargar vista actual
async function reloadCurrentView() {
    const hash = window.location.hash;
    
    if (hash.startsWith('#category')) {
        const [categoryId] = hash.split('=')[1].split('-');
        await getMoviesByCategory(categoryId);
    } else if (hash.startsWith('#movie')) {
        const movieId = hash.split('=')[1];
        await getMovieById(movieId);
    } else if (hash.startsWith('#search')) {
        const query = hash.split('=')[1];
        await getMovieBySearch(decodeURIComponent(query));
    } else {
        await getTrendingMoviePreview();
        await getCategoriesPreview();
        if (hash === '#liked') getLikedMovies();
    }
}

function likedMoviesList(){
    const item =JSON.parse(localStorage.getItem('liked_movies'));
    let movies;
    if (item) {
        movies = item;
    }else{
        movies = {};
    }
    return movies;
}

function likeMovie(movie) {
    const likedMovies = likedMoviesList();
    if (likedMovies[movie.id]) {
        likedMovies[movie.id] = undefined;
        
    } else {
        likedMovies[movie.id] = movie;
    }
    localStorage.setItem('liked_movies', JSON.stringify(likedMovies));
}

//Utils
//Uso de lazyload = todo lo que no sea visible se carga
const lazyLoader = new IntersectionObserver((entries) => {//observa todo el html por eso no lleva ..., option
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const url = entry.target.getAttribute('create-img');
            entry.target.setAttribute('src', url);
        }
    });
});


function createMovies(movies, container, {lazyLoad = true,clean =true}={}) {
    if (clean) {
        container.innerHTML = '';
    }
    movies.forEach(movie => {
        const movieContainer = document.createElement('div'); //se crea un contenedor
        movieContainer.classList.add('movie-container');//se le agrega clase
        
        const movieImage = document.createElement('img');//se crea una imagen
        movieImage.classList.add('movie-img'); //se le agrega una clase
        movieImage.setAttribute('alt', movie.title) //se agrega como alt el titulo de la pelicula
        movieImage.setAttribute(lazyLoad ? 'create-img' : 'src', `https://image.tmdb.org/t/p/w300/${movie.poster_path}`); //se agrega la imagen de la pelicula
        movieImage.addEventListener('click', () => {
            location.hash = `#movie=${movie.id}`;
        });
        movieImage.addEventListener('error', () => {
            movieImage.setAttribute('src', 'https://img.freepik.com/vector-premium/estilo-robot-error-404_18591-1536.jpg');
        });

        const movieBtn = document.createElement('button');
        movieBtn.classList.add('movie-btn');
        likedMoviesList()[movie.id] && movieBtn.classList.add('movie-btn--liked');
        movieBtn.addEventListener('click', async () => {
    movieBtn.classList.toggle('movie-btn--liked');
    likeMovie(movie);
    await getLikedMovies();
});

        if (lazyLoad)
            lazyLoader.observe(movieImage); //se observa la imagen
        movieContainer.appendChild(movieImage); //se agrega la imagen a la pelicula
        movieContainer.appendChild(movieBtn); //se agrega el boton a la pelicula
        container.appendChild(movieContainer); //se agrega la pelicula al contenedor

    });
}

function createCategories(categories, container) {
    container.innerHTML = '';
    categories.forEach(category => {
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');
        const categoryTitle = document.createElement('h3');
        categoryTitle.classList.add('category-title');
        categoryTitle.setAttribute('id', 'id' + category.id);
        categoryTitle.addEventListener('click', () => {
            location.hash = `#category=${category.id}-${category.name}`;
        })
        const categoryTitleText = document.createTextNode(category.name);
        categoryTitle.appendChild(categoryTitleText);
        categoryContainer.appendChild(categoryTitle);
        container.appendChild(categoryContainer);
    })
}


//Llamados a la API
//Funcion asincrona para conseguir peliculas en tendencia en forma de prevista
async function getTrendingMoviePreview() {
    try {
        const { data } = await API('trending/movie/day');
        const movies = data.results;
        // const trendingPreviewMoviesContainer=  document.querySelector('#trendingPreview .trendingPreview-movieList');
        createMovies(movies, trendingMoviesPreviewList);
    }
    catch (error) {
        console.log('Error en la peticion: ', error);
    }
}

async function getCategoriesPreview() {
    try {
        const { data } = await API(`genre/movie/list`);
        const categories = data.genres;
        // const categoryPreviewMoviesContainer = document.querySelector('#categoriesPreview .categoriesPreview-list');
        createCategories(categories, categoriesPreviewList);
    } catch (error) {
        console.log('Error en la funcion de vista de categorias: ' + error);

    }
}

async function getMoviesByCategory(categoryId) {
    try {
        const { data } = await API('discover/movie', {
            params: {
                'with_genres': categoryId,
            }
        });
        const movies = data.results;
        maxPage = data.total_pages;
        createMovies(movies, genericSection, {lazyLoad: true, clean: true});
    }
    catch (error) {
        console.log('Error en la peticion: ', error);
    }
}

function getPaginatedMoviesByCategory(categoryId) {
    try{
        return async function(){
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            const pageIsNotMax = page < maxPage;
            const scrollIsBottom = scrollTop + clientHeight >= scrollHeight -25;
            if (scrollIsBottom && pageIsNotMax) {
                page++;
                const { data } = await API('discover/movie', {
                    params: {
                        'with_genres': categoryId,
                        'page': page,
                    }
                });
                const movies = data.results;
                createMovies(movies, genericSection, {lazyLoad: true, clean: false});
            }
        }
    }catch(error){
        console.log('Error en la busqueda de peliculas: ', error);
    }
}

//Funcion asincrona para la busqueda de peliculas
async function getMovieBySearch(query) {
    try {
        const { data } = await API('search/movie', {
            params: {
                query,
            }
        });
        const movies = data.results;
        maxPage = data.total_pages;
        console.log(maxPage);
        
        createMovies(movies, genericSection, {lazyLoad: true, clean: true});

    } catch (error) {
        console.log('Error en la busqueda de peliculas: ', error);
    }
}

function getPaginatedMoviesBySearch(query) {
    try{
        return async function(){
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            const pageIsNotMax = page < maxPage;
            const scrollIsBottom = scrollTop + clientHeight >= scrollHeight -25;
            if (scrollIsBottom && pageIsNotMax) {
                page++;
                const { data } = await API('search/movie', {
                    params: {
                        query,
                        'page': page,
                    }
                });
                const movies = data.results;
                createMovies(movies, genericSection, {lazyLoad: true, clean: false});
            }
        }
    }catch(error){
        console.log('Error en la busqueda de peliculas: ', error);
    }
}


async function getTrendingMovies() {
    try {
        const { data } = await API('trending/movie/day');
        const movies = data.results;
        maxPage = data.total_pages;
        // const trendingPreviewMoviesContainer=  document.querySelector('#trendingPreview .trendingPreview-movieList');
        createMovies(movies, genericSection, {lazyLoad: true, clean: true});
    }
    catch (error) {
        console.log('Error en la peticion: ', error);
    }
}

// window.addEventListener('scroll', getPaginatedTrendingMovies);
async function getPaginatedTrendingMovies() {
    try {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const pageIsNotMax = page < maxPage;
        const scrollIsBottom = scrollTop + clientHeight >= scrollHeight -25
        if (scrollIsBottom && pageIsNotMax) {
            page++;
            const { data } = await API('trending/movie/day', {
                params: {
                    'page': page,
                }
            });
            const movies = data.results;
            // const trendingPreviewMoviesContainer=  document.querySelector('#trendingPreview .trendingPreview-movieList');
            createMovies(movies, genericSection, {lazyLoad: true, clean: false});
        }

    }
    catch (error) {
        console.log('Error en la peticion: ', error);
    }
}

async function getMovieById(id) {
    try {
        const { data } = await API(`movie/${id}`);
        const movieImgUrl = 'https://image.tmdb.org/t/p/w500/' + data.poster_path;
        headerSection.style.background = `
        linear-gradient(180deg,rgba(0, 0, 0, 0.35) 19.27%,rgba(0, 0, 0, 0) 29.17%),
        url(${movieImgUrl})`;

        const movie = data;
        movieDetailTitle.innerText = movie.title;
        movieDetailDescription.innerText = movie.overview;
        movieDetailScore.innerText = movie.vote_average;
        const categories = movie.genres;
        createCategories(categories, movieDetailCategoriesList);

        getRelatedMoviesById(id);
    } catch (error) {
        console.log('Error en la peticion: ', error);
    }
}

async function getRelatedMoviesById(id) {
    try {
        const { data } = await API(`movie/${id}/recommendations`);
        const movies = data.results;
        // const trendingPreviewMoviesContainer=  document.querySelector('#trendingPreview .trendingPreview-movieList');
        createMovies(movies, relatedMoviesContainer);

    } catch (error) {
        console.log('Error en la peticion: ', error);
    }
}

async function getLikedMovies() {
    const likedMovies = likedMoviesList();
    const movieIds = Object.keys(likedMovies).filter(id => likedMovies[id]);
    
    try {
        const movies = await Promise.all(
            movieIds.map(id => API(`movie/${id}`).then(res => res.data)
        ));
        createMovies(movies, likedMoviesListArticle, {lazyLoad: true, clean: true});
    } catch (error) {
        console.error('Error fetching liked movies:', error);
    }
}
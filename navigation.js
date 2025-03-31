let page = 1;
let maxPage;
let infiniteScroll;


searchFormBtn.addEventListener('click',()=>{
    location.hash = '#search='+searchFormInput.value;
});
trendingBtn.addEventListener('click',()=>{
    location.hash = '#trends';
});
arrowBtn.addEventListener('click',()=>{
    history.back();
    // location.hash = '#home;
});

window.addEventListener('hashchange', navigator);//funcion que se ejecuta cada vez que se cambia la url
window.addEventListener('DOMContentLoaded', navigator);//funcion que se ejecuta cada vez que se cambia la url
window.addEventListener('scroll', infiniteScroll);

function navigator(){
    console.log({location}); //objeto con la informacion de la url
    if(infiniteScroll){
        window.removeEventListener('scroll', infiniteScroll);
        infiniteScroll = undefined;
    }
    if(location.hash.startsWith('#trends')){ //si la url empieza con #trends
        trendPage();
    }else if(location.hash.startsWith('#search=')){
        searchMovie();
    }else if(location.hash.startsWith('#movie=')){
        movieDetail();
    }else if(location.hash.startsWith('#category=')){
        categoryView();
    }else{
        homePage();
    }
    //El scrool de las peliculas aparecen al principio
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    document.body.scrollTop = 0; // For Safari
    if(infiniteScroll){
        window.addEventListener('scroll', infiniteScroll);
    }
}

function homePage(){
    console.log('home');
    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.add('inactive');
    headerTitle.classList.remove('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.remove('inactive');
    trendingPreviewSection.classList.remove('inactive');
    likedMoviesSection.classList.remove('inactive');
    categoriesPreviewSection.classList.remove('inactive');
    genericSection.classList.add('inactive');
    movieDetailSection.classList.add('inactive');
    getTrendingMoviePreview();
    getCategoriesPreview();
    getLikedMovies();
}

function searchMovie(){
    console.log('search');
    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.remove('inactive');
    trendingPreviewSection.classList.add('inactive');
    likedMoviesSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');

    const query = location.hash.split('=')[1];
    getMovieBySearch(query)
    infiniteScroll = getPaginatedMoviesBySearch(query);
}

function movieDetail(){
    console.log('movie');
    headerSection.classList.add('header-container--long');
    // headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.add('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.add('inactive');
    trendingPreviewSection.classList.add('inactive');
    likedMoviesSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.add('inactive');
    movieDetailSection.classList.remove('inactive');

    const id = location.hash.split('=')[1];
    getMovieById(id);
}

function categoryView(){
    console.log('category');
    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.remove('inactive');
    searchForm.classList.add('inactive');
    trendingPreviewSection.classList.add('inactive');
    likedMoviesSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');

    //metodo split separa primero por el igual y toma el segundo valor,
    //luego separa por el guion y toma el primer valor
    const categoryData = location.hash.split('=')[1];
    const [categoryId, categoryName] = categoryData.split('-');
    const realName= decodeURI(categoryName);
    headerCategoryTitle.innerText = realName;
    //Llamado de una funcion
    getMoviesByCategory(categoryId);
    infiniteScroll = getPaginatedMoviesByCategory(categoryId);
}

function trendPage(){
    console.log('trend');
    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.remove('inactive');
    searchForm.classList.add('inactive');
    trendingPreviewSection.classList.add('inactive');
    likedMoviesSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');
    headerCategoryTitle.innerText = 'Tendencias';
    getTrendingMovies();
    infiniteScroll = getPaginatedTrendingMovies;
}
// Sélectionner les éléments du DOM par leurs identifiants
const formulaire = document.getElementById('formulaireDeRecherche'); // Formulaire de recherche
const recherche = document.getElementById('recherche'); // Champ de saisie pour la recherche
const affichageDeRecherche = document.getElementById('results'); // Conteneur pour afficher les résultats de la recherche
const tendancesDropdown = document.getElementById('tendancesDropdown'); // Liste déroulante pour les films tendances
const afficheDropdown = document.getElementById('afficheDropdown'); // Liste déroulante pour les films à l'affiche

// Clé API pour accéder à l'API TMDB
const apiKey = "9a6873e3fdb2ae43eec4d525f88453ee";

// Ajouter un écouteur d'événement pour la soumission du formulaire de recherche
formulaire.addEventListener('submit', function(event) {
  event.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire

  const query = recherche.value.trim(); // Récupérer la valeur de l'entrée de recherche et supprimer les espaces inutiles
  if (query) {
    searchMovies(query); // Appeler la fonction pour rechercher les films avec le terme de recherche
  }
});

// Fonction asynchrone pour rechercher des films en utilisant l'API TMDB
async function searchMovies(query) {
  // Créer l'URL pour la recherche de film en utilisant la clé API et le terme de recherche
  const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

  try {
    // Faire la requête pour chercher le film
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error('Failed to fetch search results'); // Gérer les erreurs de requête
    }
    const searchData = await searchResponse.json(); // Convertir la réponse en JSON

    // Vérifier si des résultats ont été trouvés
    if (searchData.results.length > 0) {
      const movieId = searchData.results[0].id; // Prendre l'ID du premier résultat
      // Créer l'URL pour récupérer les détails du film, y compris les vidéos (bandes-annonces) et les crédits (acteurs)
      const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=videos,credits`;

      const movieDetailsResponse = await fetch(movieDetailsUrl); // Faire la requête pour récupérer les détails du film
      if (!movieDetailsResponse.ok) {
        throw new Error('Failed to fetch movie details'); // Gérer les erreurs de requête
      }
      const movieDetails = await movieDetailsResponse.json(); // Convertir la réponse en JSON
      displayMovieDetails(movieDetails); // Appeler la fonction pour afficher les détails du film
    } else {
      // Afficher un message si aucun film n'a été trouvé
      affichageDeRecherche.innerHTML = '<p>Aucun film trouvé pour cette recherche.</p>';
    }
  } catch (error) {
    // Afficher les erreurs dans la console
    console.error('Erreur lors de la récupération des données:', error);
  }
}

// Fonction pour afficher les détails du film
function displayMovieDetails(movieDetails) {
  // Vider les résultats précédents
  affichageDeRecherche.innerHTML = '';

  // Créer un conteneur pour les détails du film
  const movieDiv = document.createElement('div');
  movieDiv.classList.add('movie-details');

  // Ajouter le titre du film
  const title = document.createElement('h2');
  title.textContent = movieDetails.title;
  movieDiv.appendChild(title);

  // Ajouter l'affiche du film
  if (movieDetails.poster_path) {
    const poster = document.createElement('img');
    poster.src = `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`;
    poster.alt = movieDetails.title;
    movieDiv.appendChild(poster);
  }

  // Ajouter le synopsis du film
  const overview = document.createElement('p');
  overview.textContent = movieDetails.overview;
  movieDiv.appendChild(overview);

  // Ajouter les acteurs principaux du film (les 8 premiers)
  const actors = movieDetails.credits.cast.slice(0, 8);
  if (actors.length > 0) {
    const actorsList = document.createElement('ul');
    actors.forEach(actor => {
      const actorItem = document.createElement('li');
      actorItem.textContent = actor.name;
      actorsList.appendChild(actorItem);
    });
    movieDiv.appendChild(actorsList);
  }

  // Ajouter la bande-annonce du film
  const trailer = movieDetails.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
  if (trailer) {
    const trailerIframe = document.createElement('iframe');
    trailerIframe.src = `https://www.youtube.com/embed/${trailer.key}`;
    trailerIframe.width = '560';
    trailerIframe.height = '315';
    trailerIframe.frameBorder = '0';
    trailerIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    trailerIframe.allowFullscreen = true;
    movieDiv.appendChild(trailerIframe);
  }

  // Ajouter le conteneur du film aux résultats
  affichageDeRecherche.appendChild(movieDiv);
}

// Fonction asynchrone pour récupérer et afficher les films tendances
async function getTrendingMovies() {
  // Créer l'URL pour récupérer les films tendances de la semaine
  const trendingUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;
  try {
    // Faire la requête pour récupérer les films tendances
    const trendingResponse = await fetch(trendingUrl);
    if (!trendingResponse.ok) {
      throw new Error('Failed to fetch trending movies'); // Gérer les erreurs de requête
    }
    const trendingData = await trendingResponse.json(); // Convertir la réponse en JSON
    displayDropdownMovies(tendancesDropdown, trendingData.results); // Afficher les films dans la liste déroulante
  } catch (error) {
    // Afficher les erreurs dans la console
    console.error('Erreur lors de la récupération des films tendances:', error);
  }
}

// Fonction asynchrone pour récupérer et afficher les films à l'affiche
async function getNowPlayingMovies() {
  // Créer l'URL pour récupérer les films actuellement à l'affiche
  const nowPlayingUrl = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}`;
  try {
    // Faire la requête pour récupérer les films à l'affiche
    const nowPlayingResponse = await fetch(nowPlayingUrl);
    if (!nowPlayingResponse.ok) {
      throw new Error('Failed to fetch now playing movies'); // Gérer les erreurs de requête
    }
    const nowPlayingData = await nowPlayingResponse.json(); // Convertir la réponse en JSON
    displayDropdownMovies(afficheDropdown, nowPlayingData.results); // Afficher les films dans la liste déroulante
  } catch (error) {
    // Afficher les erreurs dans la console
    console.error('Erreur lors de la récupération des films à l\'affiche:', error);
  }
}

// Fonction pour afficher les films dans les listes déroulantes
function displayDropdownMovies(dropdown, movies) {
  dropdown.innerHTML = ''; // Vider les résultats précédents

  // Limiter à 8 films et les afficher dans la liste déroulante
  movies.slice(0, 8).forEach(movie => {
    const movieItem = document.createElement('li');

    // Récupérer l'URL du poster du film
    const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : '';

    // Si l'URL du poster existe, créer une balise img et l'ajouter à l'élément de la liste
    if (posterUrl) {
      const posterImg = document.createElement('img');
      posterImg.src = posterUrl;
      posterImg.alt = movie.title;
      posterImg.style.width = '50px'; // Taille de l'image en miniature
      posterImg.style.marginRight = '10px'; // Espace entre l'image et le texte
      movieItem.appendChild(posterImg);
    }

    // Ajouter le titre du film à l'élément de la liste
    const movieTitle = document.createTextNode(movie.title);
    movieItem.appendChild(movieTitle);

    // Ajouter l'élément de la liste au menu déroulant
    dropdown.appendChild(movieItem);
  });
}

// Ajouter des événements de survol pour récupérer et afficher les films tendances et à l'affiche
document.getElementById('tendances').addEventListener('mouseover', getTrendingMovies); // Événement de survol pour les films tendances
document.getElementById('affiche').addEventListener('mouseover', getNowPlayingMovies); // Événement de survol pour les films à l'affiche

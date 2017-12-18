var engine = (function () {
  const KEY = "44ee8a5f8d169183241fef3b905fbdf8";
  const URL = "https://api.themoviedb.org/3/";
  let keyword = "";
  let imgURL = null;
  let activeWindow = null;
  let flag = true;

  function init() {
    document.getElementById('input').focus();
    addHandlers();
  }

  function addHandlers() {
    let btn = document.querySelector('.search-btn');
    let back = document.querySelector('.back-btn');
    btn.addEventListener('click', figFetch);
    back.addEventListener('click', goBack);
    document.addEventListener('keypress', function (ev) {
      let char = ev.char || ev.charCode || ev.which;
      if (char == 10 || char == 13) {
        btn.dispatchEvent(new MouseEvent('click'));
      }
      //     Future implementation of History API for backbutton
    });
  }

  function navigation(win) {
    window.scrollTo(0, 0);
    let results = document.getElementById('results');
    let recommended = document.getElementById('recommended');
    let cards = document.querySelectorAll('.card');
    document.querySelector('.search').classList.add('top');
    document.querySelector('h1').style.display = 'none';
    switch (win) {
      case 'results':
        activeWindow = 'results';
        results.classList.add('active');
        cards.forEach((card) => card.classList.remove('effect'));
        setTimeout(function () {
          cards.forEach((card) => card.classList.add('effect'));
        }, 100);
        recommended.classList.remove('active');
        document.querySelector('.back-btn').classList.add('on');
        break;
      case 'recommended':
        activeWindow = 'recommended';
        recommended.classList.add('active');
        cards.forEach((card) => card.classList.remove('effect'));
        setTimeout(function () {
          cards.forEach((card) => card.classList.add('effect'));
        }, 100);
        results.classList.remove('active');
        break;
    }
  }

  function goBack() {
    if (activeWindow == 'results') {
      window.location.reload(true);
    } else {
      navigation('results');
    }
  }

  function figFetch() {
    keyword = document.getElementById('input').value;
    let url = `${URL}configuration?api_key=${KEY}`;
    let req = new Request(url, {
      method: 'GET',
      mode: 'cors'
    });
    if (!keyword) {
      alert('You need to type something first.');
    } else {
      fetch(req)
        .then(response => response.json())
        .then((data) => {
          imgURL = data.images.secure_base_url;
          runSearch(keyword);
        })
        .catch(function (err) {
          console.log(err);
        })
    }
  }

  function runSearch(keyword) {
    let url = `${URL}search/movie?api_key=${KEY}&query=${keyword}`;
    fetch(url)
      .then(response => response.json())
      .then((data) => {
       flag = true;
        genPage(data);
        navigation('results');
      })
      .catch(function (err) {
        console.log(err);
      })
  }

  function genPage(data) {
    let title;
    let content;
    if (flag) {
       title = document.querySelector('#results>.title');
       content = document.querySelector('#results>.content');
    } else {
       title = document.querySelector('#recommended>.title');
       content = document.querySelector('#recommended>.content');
    }
    let message = document.createElement('h2');
    content.innerHTML = "";
    title.innerHTML = "";
    if (data.total_results == 0) {
      message.innerHTML = "No good movie or recommendations were found based on " + keyword +".";
    } else {
    message.innerHTML = "Showing the first 20 of a total of " + data.total_results + " for " + keyword + ". <br>Click on a movie to get recommendations based on it.";
    }
    title.appendChild(message);
    content.appendChild(cardBuilder(data.results));
    let nodeList = document.querySelectorAll('.content>div');
    cardLinker(nodeList);
  }

  function runRecommend(ev) {
    keyword = ev.target.children[1].textContent;
    let mID = ev.target.getAttribute('id');
    let url = `${URL}movie/${mID}/recommendations?api_key=${KEY}`;
    fetch(url)
      .then(response => response.json())
      .then(
        (data) => {
          flag = false;
          genPage(data);
          navigation('recommended')
        })
      .catch(function (err) {
        console.log(err);
      })
  }

  function cardLinker(nl) {
    nl.forEach((link) => {
      link.className = 'card pointer';
      link.addEventListener('click', runRecommend);
    })
  }

  function cardBuilder(arr) {
    //RETURNS A DOCUMENT FRAGMENT
    let df = new DocumentFragment();
    arr.forEach((movie) => {
      let card = document.createElement('div');
      let imgBOX = document.createElement('figure');
      let img = document.createElement('img');
      let mTitle = document.createElement('p');
      let mDate = document.createElement('p');
      let mRating = document.createElement('p');
      let mOverview = document.createElement('p');

      card.setAttribute('id', movie.id);
      mTitle.textContent = movie.title;
      mTitle.className = 'movietitle';
      mDate.textContent = "Release Date: " + movie.release_date;
      mRating.textContent = "Average Rating: " + movie.vote_average;
      // Some Error Handling for Information fields
      if (movie.overview.length == 0 || movie.overview == null) {
        mOverview.textContent = 'Error 4o4v : No Overview Information for this movie.'
      } else if (movie.overview.length > 300) {
        mOverview.textContent = movie.overview.substr(0, 300) + "...";
      } else {
        mOverview.textContent = movie.overview;
      }
      if (movie.poster_path != null) {
        img.src = "".concat(imgURL, 'w500', movie.poster_path);
        img.alt = "Poster of movie " + movie.title;
      } else {
        img.alt = "Error 4o4v : Movie Poster not found";
      }
      imgBOX.appendChild(img);
      imgBOX.className = 'imgBOX';
      card.appendChild(imgBOX);
      card.appendChild(mTitle);
      card.appendChild(mDate);
      card.appendChild(mRating);
      card.appendChild(mOverview);
      df.appendChild(card);
    });
    return df;
  }

  document.addEventListener('DOMContentLoaded', init);

})();

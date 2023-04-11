var searchButtonEl = document.querySelector(".search-button");
var genreEl = document.querySelector("#genre");
var keywordEl = document.querySelector("#keyword");
var authorEl = document.querySelector("#author");
var searchBarEl = document.querySelector(".search-bar");

var searchButtonHandler = async (event) => {
    event.preventDefault();

    if (genreEl.checked){
        console.log("test2");
    } else if (keywordEl.checked){
        console.log("test3");
    } else if (authorEl.checked){
        console.log(searchBarEl.value);
        fetch(`/api/scripts/writer/${searchBarEl.value}`)
            .then(function (response) {
                if (response.ok) {
                    response.json().then(function (data) {
                    response.title
                    response.description
                    response.text
                });
                } else {
                    alert("Error: " + response.statusText);
                }
            })
            .catch(function (error) {
                alert("Unable to connect to GitHub");
            });
    }

    
}

searchButtonEl.addEventListener('click', searchButtonHandler);
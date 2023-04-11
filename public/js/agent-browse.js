var searchButtonEl = document.querySelector(".search-button");
var genreEl = document.querySelector("#genre");
var keywordEl = document.querySelector("#keyword");
var authorEl = document.querySelector("#author");
var searchBarEl = document.querySelector(".search-bar");
var searchResultsEl = document.querySelector("#search-results");

var searchButtonHandler = async (event) => {
  event.preventDefault();

  if (genreEl.checked) {
    console.log("test2");
  } else if (keywordEl.checked) {
    console.log("test3");
  } else if (authorEl.checked) {
    console.log(searchBarEl.value);
    fetch(`/api/scripts/writer/${searchBarEl.value}`)
      .then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
              // Remove all child elements from the search results container
                searchResultsEl.innerHTML = "";
                
              data.forEach((script) => {
                const cardEl = `
                <div class="card mb-4" id="search-result" data-id="${
                  script.id
                }">
                    <div class="card-content">
                        <div class="script-details mb-2">
                            <p class="title is-4">${script.title}</p>
                            <p class="subtitle is-6">${script.description}</p>
                        </div>
                        <div class="content">
                            <p><strong>Author:</strong> ${
                              script.Writer.firstName
                            } ${script.Writer.lastName}</p>
                            <p>${script.text}</p>
                            <p><em>Published on ${
                              new Date(script.updatedAt).getMonth() + 1
                            }/${new Date(script.updatedAt).getDate()}/${
                  new Date(script.updatedAt).getFullYear() + 5
                }</em></p>
                        </div>
                    </div>
                </div>`;

                const cardContainer = document.createElement("div");
                cardContainer.innerHTML = cardEl.trim();
                searchResultsEl.appendChild(cardContainer.firstChild);
              });
            });
        } else {
          alert("Error: " + response.statusText);
        }
      })
      .catch(function (error) {
        alert("Unable to connect to GitHub");
      });
  }
};

searchButtonEl.addEventListener("click", searchButtonHandler);

var searchBarEl = document.querySelector(".search-bar");

var titleEl = document.querySelector("#title");
var authorEl = document.querySelector("#author");

var searchButtonEl = document.querySelector(".search-button");
var searchResultsEl = document.querySelector("#search-results");

// Function that takes in an array of search results and returns bulma cards with the search result information on each card
function createSearchCards(searchResultData) {
  searchResultsEl.removeEventListener("click", purchaseScriptHandler); // remove event listener
  // Remove all child elements from the search results container
  searchResultsEl.innerHTML = "";

  searchResultData.forEach((script) => {
    const cardEl = `
                <div class="card mb-6 search-result" data-id="${script.id}">
                  <div class="card-header">
                    <p class="card-header-title">
                      <span class="has-text-dark">Writer:
                        ${script.Writer.firstName}
                        ${script.Writer.lastName}</span>
                    </p>
                  </div>
                  <div class="card-content">
                    <div class="script-details mb-2">
                      <p class="title is-4">${script.title}</p>
                      <p class="subtitle is-6">${script.description}</p>
                    </div>
                    <div class="content">
                      <p>${script.text}</p>
                    </div>
                  </div>
                  <footer class="card-footer">
                    <a href="" class="card-footer-item message-writer" data-writerId="${script.Writer.id}">Message Writer (In Development)</a>
                    <a href="" class="card-footer-item purchase-script" data-scriptId="${script.id}">Purchase Script</a>
                  </footer>
                </div>`;
    const cardContainer = document.createElement("div");
    cardContainer.innerHTML = cardEl.trim();
    // Adds all the new scripts from the api call as bulma-card child elements to the searchResults element
    searchResultsEl.appendChild(cardContainer.firstChild);
  });
  searchResultsEl.addEventListener("click", purchaseScriptHandler); // re-attach event listener
}

// Checks the radio button chosen by the user, the value entered in the search bar, and applies the appropriate
// api call that searches for scripts based on the user's selected criteria and search term
var searchButtonHandler = async (event) => {
  event.preventDefault();

  if (titleEl.checked) {
    fetch(`/api/scripts/agent/browse/title/${searchBarEl.value}`)
      .then(function (response) {
        if (response.ok) {
          response.json().then(function (data) {
            createSearchCards(data);
          });
        } else {
          alert("Error: " + response.statusText);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  } else if (authorEl.checked) {
    fetch(`/api/scripts/agent/browse/author/${searchBarEl.value}`)
      .then(function (response) {
        if (response.ok) {
          response.json().then(function (data) {
            createSearchCards(data);
          });
        } else {
          alert("Error: " + response.statusText);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }
};

purchaseScriptHandler = async (event) => {
  // Prevent the anchor from navigating to a new page
  event.preventDefault();

  const purchaseButton = event.target;

  // Check if the clicked element has the purchase-script class
  if (purchaseButton.classList.contains("purchase-script")) {
    const scriptId = purchaseButton.getAttribute("data-scriptId");

    try {
      // Make a PUT request to the server to allow the requesting user to purchase the script
      const response = await fetch(`/api/scripts/agent/purchase/${scriptId}`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Error purchasing script");
      }

      // Update the anchor tag text and make the text-green to let the user know their purchase is successful
      purchaseButton.textContent = "Purchased";
      purchaseButton.classList.add("has-text-success");

      // Remove the purchase-script class after it has been purchased and remove the click event listener function
      // as it can no longer be applied to an already purchased script
      purchaseButton.classList.remove("purchase-script");
      purchaseButton.removeEventListener("click", purchaseScriptHandler);

      // Update the text of the writer's name in the header (nice visual representation to let the user know their purchase is successful)
      const searchResultDiv = purchaseButton
        .closest(".card-footer")
        .closest(".search-result");
      const writerInfoSpan = searchResultDiv.querySelector(
        ".card-header-title span"
      );
      writerInfoSpan.classList.remove("has-text-dark");
      writerInfoSpan.classList.add("has-text-success");

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }
};

searchButtonEl.addEventListener("click", searchButtonHandler); // displays scripts to user based off their search request
searchResultsEl.addEventListener("click", purchaseScriptHandler); // allows user to purchase script

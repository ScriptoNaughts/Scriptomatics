var editButtonEl = document.querySelector(".edit-button");
var titleTextBox = document.querySelector(".script-title");
var descTextBox = document.querySelector(".script-description");
var scriptTextBox = document.querySelector(".script-title");

var saveButtonHandler = async (event) => {
    event.preventDefault();

    fetch(`/api/scripts/edit/${event.target.getAttribute("data-id")}`)
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

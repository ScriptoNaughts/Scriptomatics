var editButtonEl = document.querySelector(".edit-button");
var titleTextBox = document.querySelector("#script-title");
var descTextBox = document.querySelector("#script-description");
var scriptTextBox = document.querySelector("#script-text");

var saveButtonHandler = async (event) => {
  event.preventDefault();

  fetch(`/api/scripts/edit/${event.target.getAttribute("data-id")}`)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          console.log("\n\nResponse:" + JSON.stringify(data) + "\n\n");
          titleTextBox.value = data.title;
          descTextBox.value = data.description;
          scriptTextBox.value = data.text;
        });
      } else {
        alert("\n\nError: " + data.statusText);
      }
    })
    .catch(function (error) {
      console.log("\n\nError" + error);
    });
};

editButtonEl.addEventListener("click", saveButtonHandler);

var workspaceEl = document.querySelector("#workspace");
var editButtonEl = document.querySelector(".edit-button");
var publishButtonEl = document.querySelector("#publish-button");
var saveButtonEl = document.querySelector("#save-button");
var newButtonEl = document.querySelector("#new-button");

var titleTextBox = document.querySelector("#script-title");
var descTextBox = document.querySelector("#script-description");
var scriptTextBox = document.querySelector("#script-text");

var editButtonHandler = async (event) => {
  if (event.target.classList.contains("edit-button")) {
    event.preventDefault();

    try {
      const response = await fetch(
        `/api/scripts/edit/${event.target.getAttribute("data-id")}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("\n\nResponse:" + JSON.stringify(data) + "\n\n");
        titleTextBox.value = data.title;
        descTextBox.value = data.description;
        scriptTextBox.value = data.text;
        scriptTextBox.dataset.id = data.id; // add data-id attribute
        scriptTextBox.classList.add("script-saved");
      } else {
        alert("\n\nError: " + data.statusText);
      }
    } catch (error) {
      console.log("\n\nError" + error);
    }
  }
};

var publishButtonHandler = async (event) => {
  event.preventDefault();

  // Get the values from the form fields
  const title = titleTextBox.value.trim();
  const description = descTextBox.value.trim();
  const text = scriptTextBox.value.trim();

  // Check if any of the fields are empty
  if (!title || !description || !text) {
    // Highlight the empty fields in red
    if (!title) {
      titleTextBox.classList.add("is-danger");
    }
    if (!description) {
      descTextBox.classList.add("is-danger");
    }
    if (!text) {
      scriptTextBox.classList.add("is-danger");
    }

    // Show an error message
    alert("Please fill in all the fields");
    return;
  }

  // Remove the red border if previously applied
  titleTextBox.classList.remove("is-danger");
  descTextBox.classList.remove("is-danger");
  scriptTextBox.classList.remove("is-danger");

  // Check if the script has been saved before
  const isSaved = scriptTextBox.classList.contains("script-saved");

  // Get the id of the script which is placed in the scriptTextBox
  const scriptId = scriptTextBox.getAttribute("data-id");

  // Make a POST or PUT request depending on whether the script has been saved before
  const method = isSaved ? "PUT" : "POST";
  const url = isSaved ? "/api/scripts/" + scriptId : "/api/scripts";
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        text,
        status: "published",
        assignedTo: null,
      }),
    });

    if (response.ok) {
      console.log(`Script ${isSaved ? "updated" : "posted"} successfully`);
      window.location.href = "/scripts/writer";
    } else {
      console.error(`Error ${isSaved ? "updating" : "posting"} script`);
    }
  } catch (error) {
    console.error(error);
  }
};

var saveButtonHandler = async (event) => {
  event.preventDefault();

  // Get the values from the form fields
  const title = titleTextBox.value.trim();
  const description = descTextBox.value.trim();
  const text = scriptTextBox.value.trim();

  // Check if any of the fields are empty
  if (!title || !description || !text) {
    // Highlight the empty fields in red
    if (!title) {
      titleTextBox.classList.add("is-danger");
    }
    if (!description) {
      descTextBox.classList.add("is-danger");
    }
    if (!text) {
      scriptTextBox.classList.add("is-danger");
    }

    // Show an error message
    alert("Please fill in all the fields");
    return;
  }

  // Remove the red border if previously applied
  titleTextBox.classList.remove("is-danger");
  descTextBox.classList.remove("is-danger");
  scriptTextBox.classList.remove("is-danger");

  // Check if the script is already saved
  const isSaved = scriptTextBox.classList.contains("script-saved");

  // Get the id of the script which is placed in the scriptTextBox
  const scriptId = scriptTextBox.getAttribute("data-id");

  // Make a POST or PUT request depending on whether the script has been saved before
  const method = isSaved ? "PUT" : "POST";
  const url = isSaved ? "/api/scripts/" + scriptId : "/api/scripts";

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: titleTextBox.value,
        description: descTextBox.value,
        text: scriptTextBox.value,
        status: "draft",
        assignedTo: null,
      }),
    });
    if (response.ok) {
      if (!isSaved) {
        // Add the script-saved class to the scriptTextBox
        scriptTextBox.classList.add("script-saved");
      }
      console.log("Script saved successfully");
      location.reload();
    } else {
      console.error("Error saving script");
    }
  } catch (error) {
    console.error(error);
  }
};

var newButtonHandler = (event) => {
  event.preventDefault();

  // Remove the script-saved class from the scriptTextBox
  scriptTextBox.classList.remove("script-saved");

  // Clear the values of the titleTextBox, descTextBox, and scriptTextBox fields
  titleTextBox.value = "";
  descTextBox.value = "";
  scriptTextBox.value = "";
};

workspaceEl.addEventListener("click", editButtonHandler);
publishButtonEl.addEventListener("click", publishButtonHandler);
saveButtonEl.addEventListener("click", saveButtonHandler);
newButtonEl.addEventListener("click", newButtonHandler);

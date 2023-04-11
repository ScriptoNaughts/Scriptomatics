var saveButtonEl = document.querySelector('.save-button');
var titleEl = document.querySelector('.title');
var textEl = document.querySelector('.text');
var descriptionEl = document.querySelector('.description');

var saveButtonHandler = async (event) => {
    event.preventDefault();


    //var apiUrl = '/api/scripts/' + event.target.getAttribute('data-id');

    // fetch(apiUrl)
    //     .then(function (response) {
    //     if (response.ok) {
    //         response.json().then(function (data) {
    //             displayRepos(data, user);
    //         });
    //     } else {
    //         alert('Error: ' + response.statusText);
    //     }
    //     })
    //     .catch(function (error) {
    //         alert('Unable to connect to GitHub');
    //     });
    let user = req.session.userID;
    let title = titleEl.textContent;
    let description = descriptionEl.textContent;
    let text = textEl.textContent;

    const response = await fetch('/api/scripts/' + event.target.getAttribute('data-id'), {
        method: 'PUT',
        body: JSON.stringify({ user, title, description, text }),
        headers: { 'Content-Type': 'application/json' },
    });

    // return JSON.stringify({
    //     writerID: req.session.userID, // Set the ID of the user making the request as the writerID
    //     title: titleEl.textContent,
    //     description: descriptionEl.textContent,
    //     text: textEl.textContent,
    //     // status: req.body.status,
    //     // assignedTo: null,
    // });
    console.log("test");

};

saveButtonEl.addEventListener('click', saveButtonHandler);
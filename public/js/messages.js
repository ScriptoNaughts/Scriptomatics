let noteTitle;
let noteText;
let submitBtn;
let noteList

if (window.location.pathname === '/index' || window.location.pathname === '/') {
    noteTitle = document.querySelector('.noteTitle');
    noteText = document.querySelector('.noteText');
    submitBtn = document.querySelector('.submitBtn');
    noteList = document.querySelector('.notes')
}

const show = (elem) => {
    elem.style.display = 'inline';
}

const hide = (elem) => {
    elem.style.display = 'none';
}

let activeNote = {};

const getNotes = () =>
    fetch('/api/notes', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        //body: JSON.stringify(note),
    });

const saveMsg = (note) =>
    fetch('/api/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
    });

const deleteNote = (id) =>
    fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

const renderActiveNote = () => {
    hide(submitBtn);

    if(activeNote.id) {
        noteTitle.setAttribute('readonly', true);
        noteText.setAttribute('readonly', true);
        noteTitle.value = activeNote.title;
        noteText.value = activeNote.text;
    } else {
        noteTitle.removeAttribute('readonly');
        noteText.removeAttribute('readonly');
        noteTitle.value = '';
        noteText.value = '';
    }
};

const handleNoteSave = () => {
    const newMessage = {
        title: noteTitle.value,
        text: noteText.value,
    };
    console.log(newMessage);
    saveMsg(newMessage).then(() => {
        getAndRenderNotes();
        renderActiveNote();
    });
};

const handleNoteDelete = (e) => {
    e.stopPropagation();

    const msg = e.target;
    const msgId = JSON.parse(msg.parentElement.getAttribute('data-note')).id;
    console.log(msgId);
    if (activeNote.id === msgId) {
        activeNote = {};
    }

    deleteNote(msgId).then(() => {
        getAndRenderNotes();
        renderActiveNote();
    });
};

const handleNoteView = (e) => {
    e.preventDefault();
    activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
    renderActiveNote();
};

const handleNewNoteView = (e) => {
    activeNote = {};
    renderActiveNote();
};

const handleRenderSaveBtn = () => {
    if (!noteTitle.value.trim() || !noteText.value.trim()) {
        hide(submitBtn);
    } else {
        show(submitBtn);
    }
};

const renderNoteList = async (notes) => {
    noteList.innerHTML = "";

    let jsonNotes = await notes.json();

    if (window.location.pathname === '/index') {
        noteList.forEach((el) => (el.innerhTML = ''));
    }

    let noteListItems = [];

    const createLi = (text, delBtn = true) => {
        const liEl = document.createElement('li');
        liEl.classList.add('list-group-item');

        const spanEl = document.createElement('span');
        spanEl.classList.add('list-item-title');
        spanEl.innerText = text;
        spanEl.addEventListener('click', handleNoteView);

        liEl.append(spanEl);

        if (delBtn) {
            const delBtnEl = document.createElement('i');
            delBtnEl.classList.add(
                'fas',
                'fa-trash-alt',
                'float-right',
                'text-danger',
                'delete-note'
            );
            delBtnEl.addEventListener('click', handleNoteDelete);

            liEl.append(delBtnEl);
        }
        return liEl;
    };


    if (jsonNotes.length === 0) {
        noteListItems.push(createLi('No saved Notes', false));
    }

    jsonNotes.forEach((note) => {
        const li = createLi(note.title);
        li.dataset.note = JSON.stringify(note);

        const button = document.createElement('button');

        button.textContent = 'delete';

        button.style.backgroundColor = 'red';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.padding = '10px 20px';
        button.style.fontSize = '16px';
        button.style.cursor = 'pointer';

        button.addEventListener('click', handleNoteDelete);
        li.appendChild(button);

        noteList.append(li);    
    });
   
};

const getAndRenderNotes = () => getNotes().then(renderNoteList);

if (window.location.pathname === '/index' || window.location.pathname === '/') {
    submitBtn.addEventListener('click', handleNoteSave);
    noteTitle.addEventListener('keyup', handleRenderSaveBtn);
    noteText.addEventListener('keyup', handleRenderSaveBtn);
}
console.log(window.location.pathname);
getAndRenderNotes();


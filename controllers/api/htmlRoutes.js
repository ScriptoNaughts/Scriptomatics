const path = require('path');

module.exports = (app) => {

    app.get('/notes', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/messages.html'));

    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/messages.html'));
    })
};
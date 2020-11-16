'use strict';

// express is a nodejs web server
// https://www.npmjs.com/package/express
const express = require('express');

// converts content in the request into parameter req.body
// https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser');

// bring in database service
// const db = require('./services/mock.database.service');
const db = require('./services/firestore.database.service');

// create the server
const app = express();

// the backend server will parse json, not a form request
app.use(bodyParser.json());

// health endpoint - returns an empty array
app.get('/', (req, res) => {
    res.json({message: 'Events backend with Firestore'});
});

// version endpoint to provide easy convenient method to demonstrating tests pass/fail
app.get('/version', (req, res) => {
    res.json({ version: '1.0.0' });
});



// this has been modifed to call the shared getEvents method that
// returns data from firestore
app.get('/events', (req, res) => {
    db.getEvents()
        .then((data) => {
            console.log(data);
            res.json(data);
        })
        .catch((err) => {
            throw new Error(`getEvents - ${err.message}`);
        });
});

// This has been modified to insert into firestore, and then call 
// the shared getEvents method.
app.post('/event', (req, res) => {
    db.addEvent(req.body)
        .then((data) => {
            console.log(data);
            res.json(data);
        })
        .catch((err) => {
            throw new Error(`addEvent - ${err.message}`);
        });
});

app.put('/event/:id', (req, res) => {
    db.updateEvent(req.params.id, req.body)
        .then (data => {
            res.json(data);
        })
        .catch(err => {
            throw new Error(`Update Event - ${err.message}`);
        })
});

// put because this is an update. Passes through to shared method.
app.put('/event/like/:id', (req, res) => {
    db.incLikes(req.params.id)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            throw new Error(`Like Event - ${err.message}`);
        });
});

// put because this is an update. Passes through to shared method.
app.put('/event/dislike/:id', (req, res) => {
    db.incDisLikes(req.params.id)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            throw new Error(`DisLike Event - ${err.message}`);
        });
});

// Delete distinguishes this route from put above
app.delete('/event/:id', (req, res) => {
    db.deleteEvent(req.params.id)
        .then(data => {
           res.json(data);
        })
        .catch(err => {
            throw new Error(`Delete Event - ${err.message}`);
        });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

const PORT = 8082;
const server = app.listen(PORT, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`Events app listening at http://${host}:${port}`);
});

module.exports = app;

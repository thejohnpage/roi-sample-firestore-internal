'use strict';

// express is a nodejs web server
// https://www.npmjs.com/package/express
const express = require('express');

// converts content in the request into parameter req.body
// https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser');

// bring in firestore
const Firestore = require("@google-cloud/firestore");

// configure with current project
const firestore = new Firestore(
    {
        projectId: process.env.GOOGLE_CLOUD_PROJECT
    }
);

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


// responsible for retrieving events from firestore and adding 
// firestore's generated id to the returned object
function getEvents(req, res) {
    const ret = { events: [] };
    firestore.collection("Events").get()
        .then((snapshot) => {
            if (!snapshot.empty) {
                snapshot.docs.forEach(doc => {
                    //get data
                    const item = doc.data();
                    //get internal firestore id
                    item.id = doc.id;
                    //add object to array
                    ret.events.push(item);
                }, this);
            }
            console.log(ret);
            res.json(ret);
        })
        .catch((err) => {
            console.error('Error getting events', err);
            res.json(ret);
        });
};



// this has been modifed to call the shared getEvents method that
// returns data from firestore
app.get('/events', (req, res) => {
    getEvents(req, res);
});

// This has been modified to insert into firestore, and then call 
// the shared getEvents method.
app.post('/event', (req, res) => {
    // create a new object from the json data. The id property
    // has been removed because it is no longer required.
    // Firestore generates its own unique ids
    const ev = {
        likes: 0,
        dislikes: 0,
        ...req.body
    }
    firestore.collection("Events").add(ev).then(ret => {
        // return events using shared method that adds __id
        getEvents(req, res);
    });
});


// function used by both like and unlike. If increment = true, a like is added.
// If increment is false, a like is removed.
function changeReaction(req, res, id, type, increment) {
    if(type === 'likes' || type === 'dislikes') {
        // return the existing objct
        firestore.collection("Events").doc(id).get()
            .then((snapshot) => {
                const el = snapshot.data();
                // if you have elements in firestore with no likes property
                if (!el[type]) {
                    el[type] = 0;
                }
                // increment the likes
                if (increment) {
                    el[type]++;
                }
                else {
                    el[type]--;
                }
                // do the update
                firestore.collection("Events")
                    .doc(id).update(el).then((ret) => {
                    // return events using shared method that adds __id
                    getEvents(req, res);
                });
            })
            .catch(err => { console.log(err) });
    } else {
        getEvents(req, res);
    }

}

// put because this is an update. Passes through to shared method.
app.put('/event/like', (req, res) => {
    changeReaction(req, res, req.body.id, 'likes',true);
});

// Passes through to shared method.
// Delete distinguishes this route from put above
app.delete('/event/like', (req, res) => {
    changeReaction(req, res, req.body.id, 'likes', false);
});

// put because this is an update. Passes through to shared method.
app.put('/event/dislike', (req, res) => {
    changeReaction(req, res, req.body.id, 'dislikes',true);
});

// Passes through to shared method.
// Delete distinguishes this route from put above
app.delete('/event/dislike', (req, res) => {
    changeReaction(req, res, req.body.id, 'dislikes', false);
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
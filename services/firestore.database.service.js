// bring in firestore
const Firestore = require("@google-cloud/firestore");

// configure with current project
const firestore = new Firestore(
    {
        projectId: process.env.GOOGLE_CLOUD_PROJECT,
        keyFilename: process.env.KEY_FILE_NAME
    }
);

const getEvents = async () => {
    const ret = { events: [] };
    try {
        const snapshot = await firestore.collection('Events').orderBy('date', 'desc').get();
        // console.log('getEvents - response.docs: ', snapshot.docs);
        if (!snapshot.empty) {
            snapshot.docs.forEach(doc => {
                // console.log('getEvents - doc: ', doc);
                //get data
                const event = doc.data();
                //get internal firestore id
                event.id = doc.id;
                //add object to array
                ret.events.push(event);
            }, this);
            // const ret = snapshot.docs;
            // console.log('getEvents - ret: ', ret);
        }
        return ret;
    } catch (e) {
        console.log('getEvents - Error: ', e.message);
        throw new Error(`getEvents - Error: ${e.message}`);
    }
}

const addEvent = async (event, returnEvents = true) => {
    event.likes = 0;
    event.dislikes = 0;
    try {
        const response = await   firestore.collection('Events').add(event);
        // console.log('addEvent - response: ', response);
        console.log('addEvent - id: ', response.id);
        if(returnEvents) {
            try {
                return await getEvents();
            } catch (e) {
                throw new Error(`addEvent - getEvents - error: ${e.message}`);
            }

        } else {
            event.id = response.id;
            return event;
        }
    } catch (e) {
        console.log('addEvent - Error: ', e.message);
        throw new Error(`addEvent - Error: ${e.message}`);
    }
}

const getEventById = async (id) => {
    try {
        const snapshot = await firestore.collection('Events').doc(id).get();
        if(!snapshot.empty) {
            const doc = snapshot.data();
            console.log('getEventById - doc: ', doc);
            return {event: doc};
        } else {
            return {event: null}
        }
    } catch (e) {
        console.log('Error - getEventById: ', e.message);
        throw new Error(`getEventById - Error: ${e.message}`);
    }
}
const getEventsByTitle = async (title) => {
    try {
        const snapshot = await firestore.collection('Events').where('title', '==', title).get();
        if(!snapshot.empty) {
            const doc = snapshot.data();
            console.log('getEventsByTitle - doc: ', doc);
            return {event: doc};
        } else {
            return {event: null}
        }
    } catch (e) {
        console.log('Error - getEventsByTitle: ', e.message);
        throw new Error(`getEventsByTitle - Error: ${e.message}`);
    }
}
const updateEvent = async (id, event, returnEvents = true) => {
    try {
        const snapshot = await firestore.collection('Events').doc(id).update(event);
        console.log('updateEvent - snapshot.docs: ', snapshot.docs);
    } catch (e) {
        console.log('Error - updateEvent: ', e.message);
        throw new Error(`updateEvent - Error: ${e.message}`);
    }
}
const deleteEvent = async (id, returnEvents = true) => {
    try {
        const snapshot = await firestore.collection('Events').doc(id).delete();
        console.log('deleteEvent - snapshot.docs: ', snapshot.docs);
    } catch (e) {
        console.log('Error - deleteEvent: ', e.message);
        throw new Error(`deleteEvent - Error: ${e.message}`);
    }
}
const getEventsCount = async (includeNull = true) => {}
const deleteLastEntry = async () => {}

// function used by both like and unlike. If increment = true, a like is added.
// If increment is false, a like is removed.
function changeReaction(id, type, increment=true) {
    if(type === 'likes' || type === 'dislikes') {
        // return the existing object
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
                    return getEvents();
                });
            })
            .catch(err => { console.log(err) });
    } else {
        return getEvents();
    }
}

const incLikes = async (id) => {
    return changeReaction(id,'likes')
}

const incDisLikes = async (id) => {
    return changeReaction(id, 'dislikes');
}


module.exports = {addEvent, getEvents, getEventById, getEventsByTitle, updateEvent, deleteEvent, getEventsCount, deleteLastEntry, incLikes, incDisLikes};

/**
 * Service to handle Events CRUD
 * Can be replaced by access to a real DBMS
 */

/**
 * mockData
 * Volatile data storage
 * @type {{events: [{description: string, id: number, title: string, location: string, eventDate: string, likes: number, dislikes: number}]}}
 */
const mockData = {
    events: [
        { title: 'an event', id: 1, description: 'something really cool', location: '', eventDate: '', likes: 0, dislikes: 0 },
        { title: 'another event', id: 2, description: 'something even cooler', location: '', eventDate: '', likes: 0, dislikes: 0 }
    ]
};

/**
 * addEvent
 * @param event
 * @param returnEvents boolean default = true = returns all events, false = return only new event
 * @returns {{events: []}|{event: *}}
 */
const addEvent = async (event, returnEvents = true) => {
    event.id = await getEventsCount() + 1; // returns qty of events (array size) used to calc next id
    event.likes = 0;
    event.dislikes = 0;
    mockData.events.push(event);
    if(returnEvents) {
        const events = getEvents();
        console.log('events: ', events);
        return events;
    } else {
        return {event: event};
    }
}

/**
 * getEvents
 * return all the non null entries in the events array
 * @returns {{events: []}}
 */
const getEvents = async (includeNulls = false) => {
    if (includeNulls) {
        return {events: mockData.events};
    } else {
        const events = [];
        mockData.events.forEach(ev => {if(ev) {events.push(ev)}});
        return {events: events};
    }
}

/**
 * getEventById
 * Returns the event from the events array referenced by the supplied ID
 * @param id
 * @returns {{event: ({description: string, id: number, title: string, location: string, eventDate: string, likes: number, dislikes: number})}}
 */
const getEventById = async (id) => {
    const index = mockData.events.findIndex((obj => obj && obj.id === parseInt(id)));
    return {event: mockData.events[index]};
}

/**
 * getEventsByTitle
 * @param title string full or partial title
 * @returns array {{events: {description: string, id: number, title: string, location: string, eventDate: string, likes: number, dislikes: number}[]}}
 */
const getEventsByTitle = async (title) => {
    const events = mockData.events.filter((obj => obj && obj.title.toLowerCase().includes(title.toLowerCase())));
    return {events};
}

/**
 * updateEvent
 * Updates the event in the events array referenced by the supplied ID
 * Only changes the modified fields/properties
 * @param id
 * @param event
 * @param returnEvents boolean default = true = returns all events, false = return only updated event
 * @returns {{event: {description: string, id: number, title: string, location: string, eventDate: string, likes: number, dislikes: number}}|{events: *[]}}
 */
const updateEvent = async (id, event, returnEvents = true) => {
    event.id = parseInt(event.id);
    const index = mockData.events.findIndex((obj => obj && obj.id === parseInt(id)));
    mockData.events[index] = {...mockData.events[index], ...event};
    const updatedEvent = mockData.events[index];
    if(returnEvents) {
        return getEvents();
    } else {
        return {event: updatedEvent};
    }
}

/**
 * deleteEvent
 * Deletes the event referenced by the supplied ID from the events array
 * by setting the entry to null. This ensures that the length of the array
 * remains the same. Which is important because the length is used to
 * generate the next ID when a new Event is added
 * @param id
 * @param returnEvents
 * @returns {{deletedEvent: {description: string, id: number, title: string, location: string, eventDate: string, likes: number, dislikes: number}}|{events: *[]}}
 */
const deleteEvent = async (id, returnEvents = true) => {
    const index = mockData.events.findIndex((obj => obj && obj.id === parseInt(id)));
    const event = mockData.events[index];
    delete mockData.events[index]; // sets the entry to null, maintains array length
    if(returnEvents) {
        return getEvents();
    } else {
        return {deletedEvent: event};
    }
}

/**
 * getEventsCount
 * @param includeNull - entries are set to null when deleted, we need the id to be unique and calc'd from size including nulls.
 *                      set to false if the count of populated entries is needed.
 * @returns {Promise<number>}
 */
const getEventsCount = async (includeNull = true) => {
    if(includeNull) {
        return mockData.events.length;
    } else {
        const events = [];
        mockData.events.forEach(ev => {if(ev) {events.push(ev)}});
        return events.length;
    }
}

/**
 * deleteLastEntry
 * Removes the last entry from the Events Array
 * @returns {Promise<void>}
 */
const deleteLastEntry = async () => {
    mockData.events.pop();
}

/**
 * incLikes - Increases the likes counter
 * @param id
 * @returns {Promise<{event: {description: string, id: number, title: string, location: string, eventDate: string, likes: number, dislikes: number}}|{events: *[]}>}
 */
const incLikes = async (id) => {
    let {event} = await getEventById(id);
    event.likes++;
    return updateEvent(id, event);
}

/**
 * incDisLikes - increases the dislikes counter
 * @param id
 * @returns {Promise<{event: {description: string, id: number, title: string, location: string, eventDate: string, likes: number, dislikes: number}}|{events: *[]}>}
 */
const incDisLikes = async (id) => {
    let {event} = await getEventById(id);
    event.dislikes++;
    return updateEvent(id, event);
}

// Makes the functions/methods available to other modules
module.exports = {addEvent, getEvents, getEventById, getEventsByTitle, updateEvent, deleteEvent, getEventsCount, deleteLastEntry, incLikes, incDisLikes};

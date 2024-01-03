const mqttHandler = require('./mqttClient')
const client = new mqttHandler();
client.connect();
//const {publishBooking, publishClinic} = require('./publisher')
//const {subscribe} = require('./subscriber')
const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()) // parse application/json
const port = 3000


// Return all clinics
app.get('/clinics', (req, res) => {
    // Put mqtt message here    
    const pubTopic = 'clinics/search/all' // Topic we're using to publish to clinic backend
    const subTopic = 'clinics/get/all' // Topic we're using to listen to clinic backend

    const message = "";
    client.sendMessage(pubTopic, subTopic, message, res, {qos:2})
})

// Return one clinic by id
app.get('/clinics/:id', (req, res) => {
    // Put mqtt message here
    const pubTopic = "clinic/search-clinic/id/request"; // Topic we're using to publish to clinic backend
    const subTopic = "frontend/search-clinic/id/reply"; // Topic we're using to listen to clinic backend
    const message = req.params.id; // Our payload/message to clinic backend - Can be an empty string in some cases

    client.sendMessage(pubTopic, subTopic, message, res, {qos:2})
})

// Return one or more clinics by name
app.get('/clinics/:name', (req, res) => {
    // Put mqtt message here
    const pubTopic = ""; // Topic we're using to publish to clinic backend
    const subTopic = ""; // Topic we're using to listen to clinic backend
    const message = ""; // Our payload/message to clinic backend - Can be an empty string in some cases

    client.sendMessage(pubTopic, subTopic, message, res, {qos:2})
})

// return all available times or just one if date is sent
app.get('/clinics/:id/availability', (req, res) => {
    const pubTopic = ""; // Topic we're using to publish to clinic backend
    const subTopic = "booking/available/" + req.params.id; // Topic we're using to listen to clinic backend

    const dateTime = req.body.realDate;
    const clinicId = req.params.id;
    /*const message = {
        date: dateTime,
        clinic: clinicId
    }*/
    const message = "";
    if (message.date) { // Send message
        // Publish to mqtt asking if date and time is available
        client.sendMessage(pubTopic, subTopic, message, res, {qos:2})
    } else { // Send another message
        // Publish to mqtt asking for all available times
        const anotherMessage = "";
        client.sendMessage(pubTopic, subTopic, anotherMessage, res, {qos:2});
    }
})

// Return all bookings
app.get('/bookings', (req, res) => {
    // Put mqtt message here
    const pubTopic = ""; // Topic we're using to publish to bookings backend
    const subTopic = ""; // Topic we're using to listen to bookings backend
    const message = ""; // Our payload/message to bookings backend - Can be an empty string in some cases

    client.sendMessage(pubTopic, subTopic, message, res, {qos:2})
})

// Return one booking by id
app.get('/bookings/:id', (req, res) => {
    // Put mqtt message here
    const pubTopic = "booking/search-booking/id/request"; // Topic we're using to publish to bookings backend
    const subTopic = "frontend/search-booking/id/reply"; // Topic we're using to listen to bookings backend
    const message = req.params.id; // Our payload/message to bookings backend - Can be an empty string in some cases
    
    client.sendMessage(pubTopic, subTopic, message, res, {qos:2})
})

// Update booking info
app.put('/bookings/:id', (req, res) => {
    // Put mqtt message here
    const pubTopic = "booking/update-booking/id/request"; // Topic we're using to publish to bookings backend
    const subTopic = "frontend/update-booking/id/reply"; // Topic we're using to listen to bookings backend
    const message = req.body; // Our payload/message to bookings backend - Can be an empty string in some cases
    
    client.sendMessage(pubTopic, subTopic, JSON.stringify(message), res, {qos:2})
})

// Delete booking
app.delete('/bookings/:id', (req, res) => {
    // Put mqtt message here
    const pubTopic = "booking/delete-booking/request"; // Topic we're using to publish to bookings backend
    const subTopic = "bookings/session/cancel"; // Topic we're using to listen to bookings backend
    const message = req.params.id; // Our payload/message to bookings backend - Can be an empty string in some cases
    
    client.sendMessage(pubTopic, subTopic, JSON.stringify(message), res, {qos:2})
})

// Check if time is booked
app.post('/bookings/availability', (req, res) => {
    // Put mqtt message here
    const pubTopic = "booking/checkAvailability";
    const subTopic = "filter/availability";
    const message = req.body;
    console.log(message);

    client.sendMessage(pubTopic, subTopic, JSON.stringify(message), res, {qos:2})
})

// Send booking request to booking handler
app.post('/booking/finalize', (req, res) => {
    // Put mqtt message here
    const pubTopic = ""; // Topic we're using to publish to bookings backend
    const subTopic = ""; // Topic we're using to listen to bookings backend
    const message = ""; // Our payload/message to bookings backend - Can be an empty string in some cases

    client.sendMessage(pubTopic, subTopic, message, res, {qos:2})
})

// Send booking cancelation to booking handler
app.post('/booking/sessions/:id/cancel', (req, res) => {
    // Put mqtt message here
    const pubTopic = "booking/sessions/delete"; // Topic we're using to publish to bookings backend
    const subTopic = "filter/session/cancel"; // Topic we're using to listen to bookings backend
    const message = req.params.id; // Our payload/message to bookings backend - Can be an empty string in some cases
    client.sendMessage(pubTopic, subTopic, message, res)
})

// Start a session to reserve timeslot  - 
app.post('/booking/reserve', (req, res) => {
    // Put mqtt message here
    const pubTopic = "booking/create"; // Topic we're using to publish to bookings backend
    const subTopic = "filter/bookingstatus"; // Topic we're using to listen to bookings backend
    const message = JSON.stringify(req.body); // Our payload/message to bookings backend - Can be an empty string in some cases
    console.log(message);
    client.sendMessage(pubTopic, subTopic, message, res, {qos:2})
})


app.get('/', (req, res) => {
    res.send("Hej");
})

app.listen(port, () => {
  console.log(`Filter listening on port ${port}`)
})
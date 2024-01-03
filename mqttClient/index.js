const { response } = require("express");
const mqtt = require("mqtt");
var responses
const shared = "$share/A/"

class MqttHandler {

    constructor() {
      this.mqttClient = null;
      this.host = 'mqtt://localhost:1884';
      this.username = 'team10'; // mqtt credentials if these are needed to connect
      this.password = 'team10';
      this.clientId = 'Filter';
      responses = [];
      setInterval(this.timeOutResponse, 3000);
    }
    
    timeOutResponse() {
      const now = new Date().getTime();
      for (let i = 0; i < responses.length; i++) {
        if (now > responses[i].expire) {
          console.log("Time out response: " + i + " : " + responses[i].subTopic);
          responses[i].res.status(500).json({ message: "Failed"});
          responses.splice(i, 1);
        }
      }
    }
    
    connect() {
      // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
      this.mqttClient = mqtt.connect(this.host, { username: this.username, password: this.password, });
      // Mqtt error calback
      this.mqttClient.on('error', (err) => {
        console.log(err);
        this.mqttClient.end();
      });
  
      // Connection callback
      this.mqttClient.on('connect', () => {
        console.log(`mqtt client connected`);
      });

      // Subscribe to all topics we expect a response from
      this.mqttClient.subscribe('clinics/get/all', {qos:2})
      this.mqttClient.subscribe('booking/dentists', {qos:2})
      this.mqttClient.subscribe('frontend/search-clinic/id/reply', {qos:2})
      this.mqttClient.subscribe('frontend/search-booking/id/reply', {qos:2})
      this.mqttClient.subscribe('frontend/update-booking/id/reply', {qos:2})
      this.mqttClient.subscribe('bookings/session/cancel', {qos:2})
      this.mqttClient.subscribe('filter/availability', {qos:2})
      this.mqttClient.subscribe('booking/created', {qos:2})
      this.mqttClient.subscribe('filter/session/cancel', {qos:2})
      this.mqttClient.subscribe('filter/bookingstatus', {qos:2})
      this.mqttClient.subscribe('booking/available', {qos:2})
      

      // When a message arrives, console.log it
      this.mqttClient.on('message', function (topic, message) {
        for(let i = 0; i < responses.length; i++) {
            try {
                if (responses[i].subTopic === topic) {
                    console.log("Sending response for topic: " + responses[i].subTopic);
                    responses[i].res.json(JSON.parse(message.toString()))
                    responses[i].mqttClient.unsubscribe(topic);
                    responses.splice(i, 1)
                    break;
            } else {
              console.log("Topic not in response array: " + topic);
            }
            
        } catch (err){
          console.log(err);
        }
    }
      });
  
      this.mqttClient.on('close', () => {
        this.mqttClient.end();
        this.connect();
      });
    }
  
    // Sends a mqtt message to topic: mytopic
    sendMessage(pubTopic, subTopic, message, res) {
        // send message
        //console.log("sendMessage:")
        //console.log(message);
        console.log("Sending message to topic: " + pubTopic);
        const expires = new Date().getSeconds() + 3;
        responses.push({subTopic: subTopic, res: res, mqttClient: this.mqttClient, expire: expires});
        if (pubTopic)
          this.mqttClient.publish((shared+pubTopic), message, {qos:2})
        
        console.log("Subscribing to : " + subTopic);
        this.mqttClient.subscribe(subTopic, {qos:2})
    }
    
  }
  
  module.exports = MqttHandler;
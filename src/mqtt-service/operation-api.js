/*
 Copyright 2021 Siemens AG
This file is subject to the terms and conditions of the MIT License.  
See LICENSE file in the top-level directory.
*/


/*#################################
    Requirements 
#################################*/
const express = require('express')
const mqtt = require('mqtt')
const cors = require('cors')
const path = require('path');

const checkAuth = require('./check-auth')
const MQTT = require('./global').MQTT
const SERVER = require('./global').SERVER
const METADATA = require('./metadata')

/*#################################
    Define Variables
#################################*/
const app = express()
const port = SERVER.PORT

const controlMsg = {
    'vals': [{
        'id': 'id',
        'val': 'val'
    }]
}
const mqttWriteTopic = MQTT.DEFAULT_TOPIC_NAME + 'w/' + MQTT.DATA_SOURCE_NAME
const mqttDataTopic = MQTT.DEFAULT_TOPIC_NAME + 'r/' + MQTT.DATA_SOURCE_NAME + '/default'

/*#################################
    Webserver
#################################*/
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors())

/* Define API Endpoints for START, STOP and RESET command */
app.get('/', (req, res) => {
    res.send('API is running')
})

app.get('/start', checkAuth, (req, res) => {
    console.log('Operation-API: Server: Start command reveived')
    controlMsg.vals[0].id = METADATA.NAME_ID_MAP.get(MQTT.TAG_NAME_START)
    controlMsg.vals[0].val = true
    msg = JSON.stringify(controlMsg)
    mqttClient.publish(mqttWriteTopic, msg);
    res.send('success')
})

app.get('/stop', checkAuth, (req, res) => {
    console.log('Operation-API: Server: Stop command reveived')
    controlMsg.vals[0].id = METADATA.NAME_ID_MAP.get(MQTT.TAG_NAME_STOP)
    controlMsg.vals[0].val = true
    msg = JSON.stringify(controlMsg)
    mqttClient.publish(mqttWriteTopic, msg);
    res.send('success')
})

app.get('/reset', checkAuth, (req, res) => {
    console.log('Operation-API: Server: Reset command received')
    controlMsg.vals[0].id = METADATA.NAME_ID_MAP.get(MQTT.TAG_NAME_RESET)
    controlMsg.vals[0].val = true
    msg = JSON.stringify(controlMsg)
    mqttClient.publish(mqttWriteTopic, msg);
    res.send('success')
})

/* Start Webserver */
app.listen(port, () => {
    console.log(`Operation-API: Server: App listening at http://localhost:${port}`)
})

/*#################################
    MQTT Connection (IE Databus)
#################################*/

/* MQTT Connection Option */
const options = {
    'clientId': 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    'protocolId': 'MQTT',
    'username': MQTT.USERNAME,
    'password': MQTT.PASSWORD
}

/* Connect MQTT-Client to MQTT Broker (IE Databus) */
console.log('Operation-API: MQTT: Connect to ' + MQTT.HOST);
const mqttClient = mqtt.connect('mqtt://' + MQTT.HOST, options);

/* Subscribe to Topic after connection is established */
mqttClient.on('connect', () => {
    console.log('Operation-API: MQTT: Connected to ' + MQTT.HOST);
    mqttClient.subscribe(mqttDataTopic, () => {
            console.log('Operation-API: MQTT: Subscribed to ' + mqttDataTopic)
    });
});

/* Reset Command after recieved message*/
mqttClient.on('message', (topic, message) => {
    msg = message.toString()
    console.log(`Data-Collector: MQTT: Recieved message ${msg} on MQTT-Topic ${topic} responding with corresponding answer`)
    // check topic name 
    if (topic == mqttDataTopic) {
        jsonmsg = JSON.parse(message)
        // check message payload 
        jsonmsg.vals.forEach(element => {
            switch (element.id) {
                case METADATA.NAME_ID_MAP.get(MQTT.TAG_NAME_START):
                    if (element.val == true) {
                        controlMsg.vals[0].id = METADATA.NAME_ID_MAP.get(MQTT.TAG_NAME_START)
                        controlMsg.vals[0].val = false
                        msg = JSON.stringify(controlMsg)
                        mqttClient.publish(mqttWriteTopic, msg);
                        console.log('Operation-API: START reseted')
                    }
                    break;
                case METADATA.NAME_ID_MAP.get(MQTT.TAG_NAME_STOP):
                    if (element.val == true) {
                        controlMsg.vals[0].id = METADATA.NAME_ID_MAP.get(MQTT.TAG_NAME_STOP)
                        controlMsg.vals[0].val = false
                        msg = JSON.stringify(controlMsg)
                        mqttClient.publish(mqttWriteTopic, msg);
                        console.log('Operation-API: STOP reseted')
                    }
                    break;
                case METADATA.NAME_ID_MAP.get(MQTT.TAG_NAME_RESET):
                    if (element.val == true) {
                        controlMsg.vals[0].id = METADATA.NAME_ID_MAP.get(MQTT.TAG_NAME_RESET)
                        controlMsg.vals[0].val = false
                        msg = JSON.stringify(controlMsg)
                        mqttClient.publish(mqttWriteTopic, msg);
                        console.log('Operation-API: RESET reseted')
                    }
                    break;
                default:
                    break;
            }
        });
    } 
})

/*
 Copyright 2020 Siemens AG
This file is subject to the terms and conditions of the MIT License.  
See LICENSE file in the top-level directory.
*/


/*#################################
    Requirements 
#################################*/
const express = require('express')
const mqtt = require('mqtt')
const bodyParser = require('body-parser')
const cors = require('cors')

const checkAuth = require('./check-auth')
const MQTT = require('./global').MQTT

/*################################# 
    Init Variables
#################################*/
const app = express()
const port = 3000

const controlMsg = {
    'vals': [{
        'id': 'id',
        'val': 'val'
    }]
}

const mqttPubTopic = MQTT.DEFAULT_TOPIC_NAME + 'w/' + MQTT.DATA_SOURCE_NAME
const mqttSubTopic = MQTT.DEFAULT_TOPIC_NAME + 'r/' + MQTT.DATA_SOURCE_NAME + '/default'


/*#################################
    Webserver
#################################*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())

/* Define API Endpoints for START, STOP and RESET command */
app.get('/start', checkAuth, (req, res) => {
    console.log('Start command reveived')
    controlMsg.vals[0].id = MQTT.VAR_ID_START
    controlMsg.vals[0].val = "TRUE"
    msg = JSON.stringify(controlMsg)
    mqttClient.publish(mqttPubTopic, msg);
    res.send('success')
})

app.get('/stop', checkAuth, (req, res) => {
    console.log('Stop command reveived')
    controlMsg.vals[0].id = MQTT.VAR_ID_STOP
    controlMsg.vals[0].val = "TRUE"
    msg = JSON.stringify(controlMsg)
    mqttClient.publish(mqttPubTopic, msg);
    res.send('success')
})

app.get('/reset', checkAuth, (req, res) => {
    console.log('Reset command received')
    controlMsg.vals[0].id = MQTT.VAR_ID_RESET
    console.log(MQTT.VAR_ID_RESET)
    controlMsg.vals[0].val = "TRUE"
    msg = JSON.stringify(controlMsg)
    mqttClient.publish(mqttPubTopic, msg);
    res.send('success')
})

/* Start Webserver */
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})



/*#################################
    MQTT-Client
#################################*/
// MQTT Connection Option 
const options = {
    'clientId': 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    'protocolId': 'MQTT',
    'username': MQTT.USER,
    'password': MQTT.PASSWORD
}

// Connect MQTT-Client to Databus (MQTT-Brocker) 
console.log('Connect to ' + MQTT.SERVER_IP);
const mqttClient = mqtt.connect('mqtt://' + MQTT.SERVER_IP, options);

// Subscribe to Topic after connection is established 
mqttClient.on('connect', () => {
    console.log('Connected to ' + MQTT.SERVER_IP);

    mqttClient.subscribe(mqttSubTopic, (err) => {
        if (!err) {
            console.log('Subscribed to ' + mqttSubTopic)
        }
    })
});

// On message received
mqttClient.on('message', (topic, message) => {
    // check topic name 
    console.log(topic)
    if (topic == mqttSubTopic) {
        message = JSON.parse(message)
        console.log(message)
        // check message payload 
        message.vals.forEach(element => {
            switch (element.id) {
                case MQTT.VAR_ID_START:
                    if (element.val == '1') {
                        controlMsg.vals[0].id = MQTT.VAR_ID_START
                        controlMsg.vals[0].val = "FALSE"
                        msg = JSON.stringify(controlMsg)
                        mqttClient.publish(mqttPubTopic, msg);
                        console.log('START reseted')
                    }
                    break;
                case MQTT.VAR_ID_STOP:
                    if (element.val == '1') {
                        controlMsg.vals[0].id = MQTT.VAR_ID_STOP
                        controlMsg.vals[0].val = "FALSE"
                        msg = JSON.stringify(controlMsg)
                        mqttClient.publish(mqttPubTopic, msg);
                        console.log('STOPreseted')
                    }
                    break;
                case MQTT.VAR_ID_RESET:
                    if (element.val == '1') {
                        controlMsg.vals[0].id = MQTT.VAR_ID_RESET
                        controlMsg.vals[0].val = "FALSE"
                        msg = JSON.stringify(controlMsg)
                        mqttClient.publish(mqttPubTopic, msg);
                        console.log('RESET reseted')
                    }
                    break;
                default:
                    break;
            }
        });
    }
})

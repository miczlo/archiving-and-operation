/*
 Copyright 2020 Siemens AG
This file is subject to the terms and conditions of the MIT License.  
See LICENSE file in the top-level directory.
*/

const Influx = require('influx');
const mqtt = require('mqtt');
const INFLUXDB = require('./global').INFLUXDB
const MQTT = require('./global').MQTT


/* Init Env Variables */
const MQTT_IP = MQTT.SERVER_IP
const MQTT_TOPIC = MQTT.DEFAULT_TOPIC_NAME + 'r/'
const DATA_SOURCE_NAME = MQTT.DATA_SOURCE_NAME + '/default'
const MQTT_USER = MQTT.USER
const MQTT_PASSWORD =MQTT.PASSWORD
const INFLUXDB_IP = INFLUXDB.INFLUXDB_IP
const INFLUXDB_DATABASE = INFLUXDB.INFLUXDB_DATABASE

//read from databus
/* MQTT Connection Option */
const options = {
    'clientId': 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    'protocolId': 'MQTT',
    'username': MQTT_USER,
    'password': MQTT_PASSWORD
}

/* Connect MQTT-Client to Databus (MQTT-Broker) */
var client = mqtt.connect('mqtt://' + MQTT_IP, options);

/* Subscribe to Topic after connection is established */
client.on('connect', () => {
    console.log('Connected to ' + MQTT_IP);
    client.subscribe(MQTT_TOPIC+DATA_SOURCE_NAME, () =>  {
        console.log('Subscribed to ' + MQTT_TOPIC+DATA_SOURCE_NAME);
    });
});

//define influxdb
const influx = new Influx.InfluxDB({
  host: INFLUXDB_IP,
  database: INFLUXDB_DATABASE,
  port: 8086,
  username: 'root',
  password: 'root',
  schema: [
    {
      measurement: "uihqiuwhe",
      fields: {
        value: Influx.FieldType.FLOAT
      },
      tags: [
        'host'
      ]
    }
  ]
})

//create database
function createDatabase() {
  influx.createDatabase(INFLUXDB_DATABASE)
  console.log("database created");
}

//wait 12 seconds before creating database (influx container needs a while to initialize)
setTimeout(createDatabase, 12000);

/* Publish response after recieved message*/
client.on('message', function (topic, message) {
    msg = message.toString()
    console.log(`Recieved message ${msg} on MQTT-Topic ${MQTT_TOPIC+DATA_SOURCE_NAME} responding with corresponding answer`)
    //write msg to influx
    var jsonmsg = JSON.parse(msg);
    console.log("received objects: ");
    console.log(jsonmsg.vals);
    jsonmsg.vals.forEach(element => { 
      influx.writePoints([
          {
            measurement: element.id,
            fields: { value: Number(element.val) },
          }
        ])
        .catch(error => {
          console.error(`Error saving data to InfluxDB! ${error.stack}`)
        })
      })
});

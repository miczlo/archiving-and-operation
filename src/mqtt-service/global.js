/*
 Copyright 2020 Siemens AG
This file is subject to the terms and conditions of the MIT License.  
See LICENSE file in the top-level directory.
*/


/*#################################
    Requirements 
#################################*/
const fs = require('fs')

/*#################################
    Define Variables
#################################*/
let MQTT
let API_SECURITY

const defaultConfiguration = {
    "API_SECURITY": {
        "USERNAME": "admin",
        "PASSWORD": "changeMe1!"
    },
    "MQTT": {
        "SERVER_IP": "ie-databus",
        "DEFAULT_TOPIC_NAME": "ie/d/j/simatic/v1/s7c1/dp/",
        "DATA_SOURCE_NAME": "Tank",
        "VAR_ID_START": "GDB_appSignals_APP_Start",
        "VAR_ID_STOP": "GDB_appSignals_APP_Stop",
        "VAR_ID_RESET": "GDB_appSignals_APP_Reset",
        "USER": "edge",
        "PASSWORD": "edge"
    },
    "INFLUXDB": {
        "INFLUXDB_IP": "influxdb",
        "INFLUXDB_DATABASE": "databus_values"
    }
}

/*#################################
    Init Programm using Configuration file
#################################*/
if (fs.existsSync('/cfg-data/config_mqtt-service.json')) {
    console.log("Configuration file exists => read configuration file")
    // Read Configuration File 
    const fileContent = JSON.parse(fs.readFileSync('/cfg-data/config_mqtt-service.json', 'utf8') )
    API_SECURITY = fileContent.API_SECURITY
    MQTT = fileContent.MQTT
    INFLUXDB = fileContent.INFLUXDB
    // Check if configuration file has the right structure
    if (MQTT != null && API_SECURITY != null) {
        console.log('ServerIP: ' + MQTT.SERVER_IP)
        if (!(MQTT.SERVER_IP
            && MQTT.DEFAULT_TOPIC_NAME
            && MQTT.DATA_SOURCE_NAME
            && MQTT.VAR_ID_START
            && MQTT.VAR_ID_STOP
            && MQTT.VAR_ID_RESET
            && MQTT.USER
            && MQTT.PASSWORD
            && API_SECURITY.USERNAME
            && API_SECURITY.PASSWORD
            && INFLUXDB.INFLUXDB_IP
            && INFLUXDB.INFLUXDB_DATABASE)) {
            console.log("Invalid configuration file => use default configuration");
            API_SECURITY = defaultConfiguration.API_SECURITY
            MQTT = defaultConfiguration.MQTT
            INFLUXDB = defaultConfiguration.INFLUXDB
        } else {
            console.log("Valid configuration file");
        }
    } else {
        console.log("Invalid configuration file => use default configuration");
        API_SECURITY = defaultConfiguration.API_SECURITY
        MQTT = defaultConfiguration.MQTT
        INFLUXDB = defaultConfiguration.INFLUXDB
    }
} else {
    console.log("No configuration file provided => use default configuration");
    API_SECURITY = defaultConfiguration.API_SECURITY
    MQTT = defaultConfiguration.MQTT
    INFLUXDB = defaultConfiguration.INFLUXDB
}

/*#################################
    Export Variables
#################################*/
module.exports = {
    "MQTT": MQTT,
    "API_SECURITY": API_SECURITY,
    "INFLUXDB": INFLUXDB
}
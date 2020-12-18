# Implementation

- [Implementation](#implementation)
  - [App Configuration](#app-configuration)
    - [Bind-Mount Volume for configuration file](#bind-mount-volume-for-configuration-file)
    - [Default app configuration](#default-app-configuration)
    - [Read configuration file](#read-configuration-file)
  - [Connect to IE Databus](#connect-to-ie-databus)
    - [MQTT-Client options](#mqtt-client-options)
    - [Connect MQTT-Client to IE Databus](#connect-mqtt-client-to-ie-databus)
    - [Subscribe to Topics on IE Databus](#subscribe-to-topics-on-ie-databus)
    - [Publish to Topic on IE Databus](#publish-to-topic-on-ie-databus)
    - [On Message](#on-message)
  - [API with NodeJs and Express](#api-with-nodejs-and-express)
    - [Http Get-Request Endpoint](#http-get-request-endpoint)
    - [Start Webserver](#start-webserver)


## App Configuration

### Bind-Mount Volume for configuration file

```docker
volumes:
      - './publish/:/publish/'
      - './cfg-data/:/cfg-data/'
```

### Default app configuration
```js
const defaultConfiguration = {
    "API_SECURITY": {
        "USERNAME": "admin",
        "PASSWORD": "changeMe1!"
    },
    "MQTT": {
        "SERVER_IP": "ie_databus",
        "DEFAULT_TOPIC_NAME": "ie/d/j/simatic/v1/s7c1/dp/",
        "DATA_SOURCE_NAME": "tank",
        "VAR_ID_START": "GDB.appSignals.APP_Start",
        "VAR_ID_STOP": "GDB.appSignals.APP_Stop",
        "VAR_ID_RESET": "GDB.appSignals.APP_Reset",
        "USER": "edge",
        "PASSWORD": "edge"
    },
    "INFLUXDB": {
        "INFLUXDB_IP": "influxdb",
        "INFLUXDB_DATABASE": "databus_values"
    }
}
```

### Read configuration file
```js
const fileContent = JSON.parse(fs.readFileSync('/cfg-data/config_mqtt-service.json', 'utf8') )
```

## Connect to IE Databus

### MQTT-Client options
```js
const options = {
    'clientId': 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    'protocolId': 'MQTT',
    'username': MQTT.USER,
    'password': MQTT.PASSWORD
}
```

### Connect MQTT-Client to IE Databus
```js
const mqttClient = mqtt.connect('mqtt://' + MQTT.SERVER_IP, options);
```

### Subscribe to Topics on IE Databus
```js
mqttClient.on('connect', () => {
    mqttClient.subscribe(mqttSubTopic, (err) => {
        if (!err) {
            console.log('Subscribed to ' + mqttSubTopic)
        }
    })
});
```

### Publish to Topic on IE Databus
```js
mqttClient.publish(mqttPubTopic, msg);
```

### On Message
```js
mqttClient.on('message', (topic, message) => {
    //do something
}
```

## API with NodeJs and Express

### Http Get-Request Endpoint
```js
app.get('/start', checkAuth, (req, res) => {
    //do something
})
```



### Start Webserver
```js
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
```

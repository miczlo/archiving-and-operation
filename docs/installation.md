# Installation

- [Installation](#installation)
  - [Build Application](#build-application)
    - [Download Repository](#download-repository)
    - [Build docker graphics](#build-docker-graphics)
  - [Upload Application to Industrial Edge Management](#upload-application-to-industrial-edge-management)
    - [Connect your Industrial Edge App Publisher](#connect-your-industrial-edge-app-publisher)
    - [Create new Application in Industrial Edge Management](#create-new-application-in-industrial-edge-management)
    - [Configure IE Databus and SIMATIC S7 Connector](#configure-ie-databus-and-simatic-s7-connector)
    - [Add Edge App configuration & upload configuration file to Industrial Edge Management](#add-edge-app-configuration--upload-configuration-file-to-industrial-edge-management)
        - [API Security](#api-security)
        - [MQTT](#mqtt)
        - [InfluxDB](#influxdb)
  - [Install Application on Industrial Edge Device](#install-application-on-industrial-edge-device)
    - [Edge App configuration](#edge-app-configuration)
    - [Install Edge App](#install-edge-app)
    - [Configure Grafana](#configure-grafana)



## Build Application

### Download Repository
Download or clone the repository source code to your workstation.

### Build docker graphics

Open terminal in the project root path where docker-compose.yml is located and execute: 
```bash
docker-compose build
```
This command builds the docker graphics of the services which are specified in the docker-compose.yml file.
![create-app](graphics/buildapp.gif)
 

## Upload Application to Industrial Edge Management

Please find below a short description how to publish your application in your IEM.

For more detailed information please see the section for [uploading apps to the IEM](https://github.com/industrial-edge/).

### Connect your Industrial Edge App Publisher

- Connect your Industrial Edge App Publisher to your docker engine
- Connect your Industrial Edge App Publisher to your Industrial Edge Managment

### Create new Application in Industrial Edge Management

- Create a new Project or select a existing one
- Create new Application
- Import the [docker-compose](../docker-compose.yml) file using the **Import YAML** button
- The warnings <br> `Build (Detail) (services >> mqtt-service >> build) is not supported` <br> 
  `Build (Detail) (services >> influxdb >> build) is not supported.` <br> 
  `Build (Detail) (services >> grafana >> build) is not supported.` <br>
  can be ignored

- Delete Port Settings of Grafana Service (grafana)

- Configure reverse proxy of Grafana Service (grafana)
    ```txt
    Container Port: 3000
    Protocol: HTTP 
    Service Name: grafana/
    Rewrite Target: /grafana
    ```

- Delete Port Settings of MQTT Service (mqtt-service)

- Configure reverse proxy MQTT Service (mqtt-service)
    ```txt
    Container Port: 3000
    Protocol: HTTP 
    Service Name: mqtt-service
    Rewrite Target: /
    ```
![ieap](graphics/ieap.gif)

- Click on `Review` and `Validate & Create`. When asked about the redirect URL, select the endpoint of the grafana service:

![iearedirect urlp](graphics/redirect_url.png)


- **Start Upload** to transfer the app to Industrial Edge Managment
- Further information about using the Industrial Edge App Publisher can be found in the [IE Hub](https://iehub.eu1.edge.siemens.cloud/documents/appPublisher/en/start.html)

---

### Configure IE Databus and SIMATIC S7 Connector  
1. Configure a user with password in the IE Databus for the SIMATIC S7 Connector and the Archiving & Operation Application for publishing and subscribing to topics on the IE Databus. 
   ```txt
   User name: edge 
   Password: edge 
   Topic: ie/# 
   Permission: Publish and Subscribe
   ```
![iedatabus](graphics/iedatabus.gif)

2. Add the PLC as a data source with data source type e.g. OPC-UA. Name of Datasource needs to 
3. Add variables to collect data as described in Archiving & Visualization How To [docs](https://github.com/industrial-edge/archiving-and-visualization/README.md#prerequisite).
4. Add Variables wit Access mode "read & write"
  ```txt
  Start 
    Name: GDB_appSignals_APP_Start
    Address: ns=3;s="GDB"."appSignals"."APP_Start"
  Stop 
    Name: GDB_appSignals_APP_Stop 
    Address: ns=3;s="GDB"."appSignals"."APP_Stop"
  Reset 
    Name: GDB_appSignals_APP_Reset
    Address: ns=3;s="GDB"."appSignals"."APP_Reset"
  ```
![s7connector](graphics/simatic-s7-connector.png)

4. Enter Databus credentials and enable Bulk Publish <br>

<a href="graphics/simatic-s7-connector-bulk.png"><img src="graphics/simatic-s7-connector-bulk.png" height="50%" width="50%" ></a>
<br>

### Add Edge App configuration & upload configuration file to Industrial Edge Management
The MQTT Service can be configured with a configuration file. The file is located in "src/mqtt-service/config-file". If no configuration file during app installation is provided, the application uses the default values seen in the following json-file.
```json
{
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
```

> :warning: Do not rename this file

1. Modify configuration file for the mqtt service (mqtt-service/config-file/config_mqtt-service.json)
If you don't use the default values the file has to be modified. 

![editconfigfile](graphics/editconfigfile.gif)


##### API Security
Set your own username and password. These credentials are later needed when configuring the operations-panel in Grafana.
- USERNAME: The username is needed to authenticate at the MQTT API 
- PASSWORD: The password is needed to authenticate at the MQTT API (change recommended)
##### MQTT
- SERVER_IP: This is the service name of the IE Databus (don't change)
- DEFAULT_TOPIC_NAME: This is the default topic root path where to publish messages on the IE Databus to write data to a PLC (don't change)
- DATA_SOURCE_NAME: The data source Name is configured in the SIMATIC S7 Connector Configurator. Insert here the data source Name for your PLC-Connection
- VAR_ID_START, VAR_ID_STOP, VAR_ID_RESET: The variable IDs are the names of the PLC-Tags (Datablock GDP > Variable appSignals > APP_Start, APP_Stop APP_Reset) which are configured in the data source of the SIMATIC S7 Connector Configurator.
- USER, PASSWORD: The user and password are configured in the IE Databus and used in the SIMATIC S7 Connector for accessing (publish, subscribe) to topics on the IE Databus
##### InfluxDB
- INFLUXDB_IP: Service name of InfluxDB which is specified in docker-compose. Do not change unless you are trying to connect to a different instance of influxdb. Grafana adds a datasource from type InfluxDB and connects to same InfluxDB instance using the same service name.
- INFLUXDB_DATABASE: InfluxDB can have multible database running in the same instance. Data which are collected from databus are written to that database. Grafana adds as datasource the InfluxDB and specifies this database as data input.

1. Select your application in Industrial Edge Management
2. Add Configuration to application and upload edited configuration file
   ```txt
   Display Name: mqtt-config
   Description: mqtt.config
   Host Path: ./cfg-data/
   Add Template 
   - Name: mqtt-config-template
   - Description: mqtt-config-template
   ```

![edge-app-configuration](graphics/addconfiguration.gif)

## Install Application on Industrial Edge Device

### Edge App configuration
Modify and select Edge app configuration accordingly.

### Install Edge App
Install Edge Application to Industrial Edge Device and select app configuration
![Install Application](graphics/installapp.gif)

---

### Configure Grafana
1. Open Industrial Edge Device in Browser and open installed application
2. Login to Grafana-Dashboard UI: Username: admin, Password: admin
3. Grafana Welcome Page: Open Dashboard Manager
4. Open Operations Panel
5. Edit Button in Operations Panel
6. Replace the IP-Address (192.168.253.144) with the IP-Address of your Industrial Edge Device and insert Username and Password for the API Security from configuration file
7. Repeat this procedure for all Buttons (Start, Stop, Reset)
![Edit Operation Panel](graphics/grafana.gif)
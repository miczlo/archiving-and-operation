FROM grafana/grafana:7.1.3

WORKDIR /var/lib/grafana/plugins/

RUN wget https://github.com/cloudspout/cloudspout-button-panel/archive/7.0.4.tar.gz \
    && tar xfvz 7.0.4.tar.gz \
    && rm 7.0.4.tar.gz

WORKDIR /

COPY grafana.ini /etc/grafana/

COPY dashboards/ /etc/grafana/provisioning/dashboards/
COPY datasources/ /etc/grafana/provisioning/datasources/

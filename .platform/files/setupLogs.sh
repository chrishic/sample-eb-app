#!/bin/sh
# By default logs output to /var/log/web.stdout.log are prefixed. We want just the raw logs from the app.
# This updates the rsyslog config. Also grants read permissions to the log files.

set -eu

mv .platform/files/rsyslogWebConf.conf /etc/rsyslog.d/web.conf

touch /var/log/web.stdout.log
touch /var/log/web.stderr.log
chmod +r /var/log/web.stdout.log
chmod +r /var/log/web.stderr.log

systemctl restart rsyslog.service
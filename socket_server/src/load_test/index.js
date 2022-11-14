require('dotenv').config({ path: `${__dirname}/../../.env` });
const {io} = require('socket.io-client');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const URL = 'http://localhost:3334';
const LOGS_PATH = path.join(__dirname, './logs.json');
const USERS_CREDENTIALS_PATH = path.join(__dirname, './users_creds.json');
const USERS_CREDENTIALS = JSON.parse(fs.readFileSync(USERS_CREDENTIALS_PATH, { encoding: "utf8" }));

const events = {
    'client:sync_app': 'client:sync_app',
    'client:send_message': 'client:send_message',
    'server:sync_app': 'server:sync_app',
    'server:send_message': 'server:send_message',
};

const polling_percentage = 0.05;
const frequency_send_message_pre_user_ms = 100;
const messages_each_iteration_per_user = 500;
const each_report_time = 1000;
const record_report_log_after_ms = 15000;
let reports_count = 5;

const pending_message = {};

const message_receiving_times = [];

const reportEachSecond = {
    sentMessages: 0,
    receivedMessages: 0
};

const reporter = new (function Report() {
    const data = {
        // [0] is sent messages count
        // [1] is received messages count
        statistics_each_second: [],
        total: {
            sentMessages: 0,
            receivedMessages: 0
        }
    };

    this.recordReportOfSecond = function (rowOfSecond) {
        data.statistics_each_second.push(`${rowOfSecond.sentMessages}:${rowOfSecond.receivedMessages}`);

        data.total.sentMessages += rowOfSecond.sentMessages;
        data.total.receivedMessages += rowOfSecond.receivedMessages;
    };

    this.getReport = function () {
        return data;
    };
})();

function createConnections(tokens) {
    return tokens.map(token => {
      const transports = Math.random() < polling_percentage ? ["polling"] : ["polling", "websocket"];

      const socket = io(`${URL}/message`, {
          transports,
          auth: {
              username: "some_username",
              token
          },
          authConnect: true,
      });

      socket.emit(events["client:sync_app"]);

      socket.on(events["server:send_message"], (data) => {
          const sentDate = pending_message[data.messageId];
          message_receiving_times.push(new Date().getTime() - sentDate);
          delete pending_message[data.messageId];
          reportEachSecond.receivedMessages++;
      });

      return socket;
  })
}

function signInUsers(credentials) {
    return Promise.all(credentials.map((signInData) => axios.post(`http://localhost:3335/user/login`, signInData)
        .then(response => response.data.token)))
        .catch(error => {
            console.error(`Error: ${error.response.data.message}`);
            process.exit(1);
        });
}

(async function startLoadTesting() {
    console.log('Load test started');

    const connections = await signInUsers(USERS_CREDENTIALS).then(createConnections);

    connections.map((connection, index) => {
        return setInterval(() => {
            for (let i = 0; i < messages_each_iteration_per_user; i++) {
                const id = `${index}${uuid.v4()}`;
                pending_message[id] = new Date().getTime();
                connection.emit(events["client:send_message"], {
                    messageId: id
                });
                reportEachSecond.sentMessages++;
            }
        }, frequency_send_message_pre_user_ms);
    }).forEach((interval) => setTimeout(() => clearInterval(interval), each_report_time * reports_count));

    const printReportPerInterval = setInterval(() => {
        reporter.recordReportOfSecond(reportEachSecond);
        reportEachSecond.receivedMessages = 0;
        reportEachSecond.sentMessages = 0;

        if (--reports_count === -1) {
            clearInterval(printReportPerInterval);

            setTimeout(() => {
                const report = reporter.getReport();
                report[`after_${record_report_log_after_ms}_ms`] = {
                    sentMessages: report.total.sentMessages + reportEachSecond.sentMessages,
                    receivedMessages: report.total.receivedMessages + reportEachSecond.receivedMessages
                };

                report.message_receiving_delay = getStatistics(message_receiving_times);
                report.not_received_messages_count = Object.keys(pending_message).length;

                recordLogs(report)
            }, record_report_log_after_ms);
        }
    }, each_report_time);
})();

function recordLogs(log) {
    fs.readFile(LOGS_PATH, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            fs.writeFile(LOGS_PATH, JSON.stringify(log, null, "\t"), () => {
                console.log('Logs recorded !')
                process.exit();
            });
        }
    });
}

function getStatistics(arr = []) {
    return {
        min: Math.min(...arr),
        max: Math.max(...arr),
        avg: (arr.reduce((acc, el) => acc + el, 0) / arr.length),
    }
}
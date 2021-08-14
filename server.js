const WebSocket = require('ws');
const commandLineArgs = require('command-line-args');
const Serializer = require('./utils/serializer.js')

const BOOT_NOTIFICATION = 'BootNotification'
const HEARTBEAT = 'Heartbeat'
const STATUS_NOTIFICATION = 'StatusNotification'

const cli_options = [
  {
    name: 'debug',
    alias: 'd',
    type: Boolean,
  },
  {
    name: 'port',
    alias: 'p',
    type: String,
  },
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
  },
];

const cli = commandLineArgs(cli_options);

if (cli.debug) {
  process.env.DEBUG = true;
}

if (cli.port) {
  process.env.PORT = cli.port;
}

if (cli.help) {
  console.log(`\n\n-p | Port to run the server on \n-d | Turn on debug mode\n-h | Help \n\n`);
  process.exit(0);
}

const wss = new WebSocket.Server({port: process.env.PORT || 3002});


function generatePayload(message, data = {}){
  var date = new Date();
  datestring = date.toISOString();
  return Serializer.encode([3, message[1], {...{"status":"Accepted", "currentTime": datestring}, ...data}])
}

function handleBootNotification(message, ws){
  ws.send(generatePayload(message, {"interval":100}))
}

function handleHeartbeat(message, ws){
  ws.send(generatePayload(message))
}

function handleStatusNotification(message, ws){
  ws.send(generatePayload(message))
}

function handleMessage(message, ws){
  switch(message[2]) {
    case BOOT_NOTIFICATION:
      handleBootNotification(message, ws)
      break;
    case HEARTBEAT:
      handleHeartbeat(message, ws)
      break;
    case STATUS_NOTIFICATION:
      handleStatusNotification(message, ws)
      break;
    default:
      console.debug("Unknown message type")
  }
}

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.debug('received: %s', message);
    message = Serializer.decode(message)
    handleMessage(message, ws)
  });
});

console.log(("CSMS server running on port: " + (process.env.PORT || 3002)))
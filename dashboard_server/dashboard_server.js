var ws = require("nodejs-websocket");
var amqp = require('amqplib/callback_api');

var MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    assert = require('assert');

var url = 'mongodb://exceptionless.model.grangeagent.com:27017/feature_results';
var rabbitURI = "amqp://policy_runner:policy_runner@cl-buildmonitor";

var server;
var collection;

MongoClient.connect(url, function(err, db) {
    console.log("Connected successfully to mongo");
    amqp.connect(rabbitURI, function (err, conn) {
        conn.createChannel(function (err, ch) {
            ch.assertQueue('test_finished', {
                durable: true
            });

            ch.prefetch(1);
            console.log("Waiting...");
            ch.consume('test_finished', function (msg) {
                console.log("TEST FINISHED: " + msg + "\r\n");
                collection = db.collection('results');
                collection.find({}).sort( { Completed: -1 } ).limit(1).toArray(function(err, docs) {
                    server.connections.forEach(function (connection) {
                        connection.sendText(JSON.stringify({ "type": "results", "results": docs }));
                        console.log("SENDING TO CLIENT: " + connection + "\r\n");
                    });
                    ch.ack(msg);
                });
                
            }, {
                noAck: false
            });
        });
    });
    server = ws.createServer(function(conn) {
        conn.role = null;
        conn.on("text", function (str) {
            var message = getMessageFromText(str);
            if (message === null || message === undefined) {
                sendError(conn, "Couldn't understand message '" + str + "'");
                return;
            }

            if(message.type === "give_latest"){
                collection = db.collection('results');
                collection.find({}).sort( { Completed: 1 } ).toArray(function(err, docs) {
                    conn.sendText(JSON.stringify({ "type": "results", "results": docs }));
                });
                return;
            }

             if(message.type === "get_details"){
                var id = message.params.id;
                collection = db.collection('results');
                var objId = null;
                try{
                    objId = new ObjectID(id);
                }catch(e){
                    return;
                }
                collection.find({ _id: new ObjectID(id) }).toArray(function(err, docs) {
                    try{
                        conn.sendText(JSON.stringify({ "type": "details", "details": docs[0] }));
                    }catch(e){
                        //sendError()
                    }
                });
                return;
            }
        });
        conn.on("error", function(err){
            console.log(err + "\r\n");
        });
    }).listen(876);
    console.log("PolicyRunnerDashboard listening on port 876...");
});

function sendError(conn, messageText) {
    //conn.sendText(JSON.stringify({ type: "message-error", message: messageText }));
}

function getMessageFromText(text) {
    try {
        return JSON.parse(text);
    } catch(e) {
        return null;
    }
}
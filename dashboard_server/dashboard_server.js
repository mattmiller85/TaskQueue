var ws = require("nodejs-websocket");
var amqp = require('amqplib/callback_api');

var MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    assert = require('assert');

var url = 'mongodb://exceptionless.model.grangeagent.com:27017/feature_results';
var rabbitURI = "amqp://policy_runner:policy_runner@cl-buildmonitor";

amqp.connect(rabbitURI, function (err, conn) {
    conn.createChannel(function (err, ch) {
        ch.assertQueue('test_finished', {
            durable: true
        });

        ch.prefetch(1);
        console.log("Waiting...");
        ch.consume('test_finished', function (msg) {
            console.log("TEST FINISHED: " + msg);
            // Insert some documents
            collection.find({}).sort( { Completed: -1 } ).limit(1).toArray(function(err, docs) {
                server.connections.forEach(function (connection) {
                    connection.sendText(JSON.stringify(docs));
                });
                ch.ack(msg);
            });
            
        }, {
            noAck: false
        });
    });
});

var server;
var collection;

MongoClient.connect(url, function(err, db) {
    console.log("Connected successfully to mongo");
    server = ws.createServer(function(conn) {
        conn.role = null;
        conn.on("text", function (str) {
            var message = getMessageFromText(str);
            console.log(str);
            if (message === null || message === undefined) {
                sendError(conn, "Couldn't understand message '" + str + "'");
                return;
            }

            if(message.type === "give_latest"){
                console.log(message);
                collection = db.collection('results');
                // Insert some documents
                collection.find({}).sort( { Completed: 1 } ).toArray(function(err, docs) {
                    conn.sendText(JSON.stringify({ "type": "results", "results": docs }));
                    console.log(docs);
                });
                return;
            }

             if(message.type === "get_details"){
                var id = message.params.id;
                collection = db.collection('results');
                collection.find({ _id: new ObjectID(id) }).toArray(function(err, docs) {
                    //console.log("blah" + docs[0]);
                    conn.sendText(JSON.stringify({ "type": "details", "details": docs[0] }));
                });
                return;
            }
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
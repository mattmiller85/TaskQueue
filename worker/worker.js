//This needs to call the console app that runs the test, transforms the results and shoves the result to mongo
//Once that console app is finished should we
//  a) have these workers directly connect to the websocket server that the ui is on and report that there's a new result
//  b) have the websocket server and these runners use a rabbit queue to announce results
//
//Leaning towards b) because if we just have the workers pass a message rabbit that they're done with a policy, then the 
//ui (dashboard) and a notifier (email, other) can both subscribe to it and get the updates and the websocket is only concerned about the ui still


var amqp = require('amqplib/callback_api');

var region = "production";
var branch = "PreProduction";
var profile = "preproduction";
var rabbitURI = "amqp://policy_runner:policy_runner@cl-buildmonitor";
var queueName = 'policy_queue';
var cucumberRunnerLoggerCommand = "dotnet \"C:\\TFS\\Grange Commercial SEQ\\TOOLS\\TaskQueue\\runner\\bin\\Debug\\netcoreapp1.1\\runner.dll\"";

amqp.connect(rabbitURI, function (err, conn) {
    conn.createChannel(function (err, ch) {
        listenForPolicyDetailsAndExecuteRunner(ch, function (message, channel) {
            var exec = require('child_process').exec;            
            var policy_info = JSON.parse(message.content.toString());
            console.log(policy_info);
            var cmd = cucumberRunnerLoggerCommand + " -policy " + policy_info.policy +
                " -symbol " + policy_info.symbol +
                " -mod " + policy_info.mod +
                " -mastercompany " + policy_info.company +
                " -region " + region +
                " -branch " + branch +
                " -profile " + profile;
            console.log("Executing " + cmd);
            exec(cmd, function (error, stdout, stderr) {
                // command output is in stdout
                console.log("Done.");
                channel.ack(message);
                console.log("Waiting...");
            });
        });
    });
});

function listenForPolicyDetailsAndExecuteRunner(ch, callback) {
    ch.assertQueue(queueName, {
        durable: true
    });

    ch.prefetch(1);
    console.log("Waiting...");
    ch.consume(queueName, function (msg) {
        callback(msg, ch);
    }, {
        noAck: false
    });
}
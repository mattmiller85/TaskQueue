

//This needs to call the console app that runs the test, transforms the results and shoves the result to mongo
//Once that console app is finished should we
//  a) have these workers directly connect to the websocket server that the ui is on and report that there's a new result
//  b) have the websocket server and these runners use a rabbit queue to announce results
//
//Leaning towards b) because if we just have the workers pass a message rabbit that they're done with a policy, then the 
//ui (dashboard) and a notifier (email, other) can both subscribe to it and get the updates and the websocket is only concerned about the ui still


var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'work_list';

        ch.assertQueue(q, {
            durable: true
        });
        ch.prefetch(1);
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(q, function (msg) {
            var secs = msg.content.toString().split('.').length - 1;

            console.log(" [x] Received %s", msg.content.toString());
            setTimeout(function () {
                console.log(" [x] Done");
                ch.ack(msg);
            }, secs * 1000);
        }, {
            noAck: false
        });
    });
});
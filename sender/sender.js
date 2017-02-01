

//This should already be pretty well flushed out in the web service that workflow calls
//So, this is just here for fun

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'work_lis';
        var msg = process.argv.slice(2).join(' ') || "Hello World!";

        ch.assertQueue(q, {
            durable: true
        });
        ch.sendToQueue(q, new Buffer(msg), {
            persistent: true
        });
        console.log(" [x] Sent '%s'", msg);
    });
    setTimeout(function () {
        conn.close();
        process.exit(0)
    }, 500);
});
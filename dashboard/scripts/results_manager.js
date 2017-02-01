/*jslint node: true */
'use strict';

function ResultsManager(options) {
    var self = this;
    self.ws = new WebSocket("http://localhost:876");
    self.ws.onmessage = function (event) {
        console.log(event.data);
    }

}

ResultsManager.prototype.askForLatestResults = function (numResults) {
    var self = this;
    if (numResults == null)
        numResults = 50;
    self.ws.send({
        "type": "give_latest",
        "params": {
            "count": numResults
        }
    });
};

module.exports = ResultsManager;
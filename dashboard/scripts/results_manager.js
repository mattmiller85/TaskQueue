/*jslint node: true */
'use strict';

function ResultsManager(options) {
    var self = this;
    self.options = options;
    self.ws = new WebSocket("ws://localhost:876");
    self.ws.onmessage = function (event) {
        var results = JSON.parse(event.data);
        if(results.type === "results"){
            if(self.options.gotResultsCallback){
                self.options.gotResultsCallback(results.results);
            }
        }
        if(results.type === "details"){
            if(self.options.gotDetailsCallback){
                self.options.gotDetailsCallback(results.details);
            }
        }
    }
    self.ws.onopen = function(e) {
        if(self.options.opened){
            self.options.opened();
        }
    };
}

ResultsManager.prototype.askForLatestResults = function (numResults) {
    var self = this;
    if (numResults == null)
        numResults = 50;
    self.ws.send(JSON.stringify({
        "type": "give_latest",
        "params": {
            "count": numResults
        }
    }));
};

ResultsManager.prototype.getDetails = function (id) {
    var self = this;
    self.ws.send(JSON.stringify({
        "type": "get_details",
        "params": {
            "id": id
        }
    }));
};

module.exports = ResultsManager;
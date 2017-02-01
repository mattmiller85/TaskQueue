/*jslint node: true */
'use strict';

function ResultsManager() {
  var self = this;
  //self.ws = new WebSocket("http://localhost:876");

  
}

ResultsManager.prototype.askForLatestResults = function(numResults){
    alert("here");
    // var self = this;
    // if(numResults == null)
    //     numResults = 50;
    // self.ws.send({ "type": "give_latest", "params": { "count": numResults } });
};



module.exports = ResultsManager;
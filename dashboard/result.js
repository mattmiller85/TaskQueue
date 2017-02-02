(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ResultsManager = require("./results_manager.js");

var ViewModel = {
        result: ko.observable({"_id":"",
            "PCName":"",
            "Pass":false,
            "Fail":false,
            "IsErrorOutput":false,
            "Output":"",
            "PremiumDifferences":{},"IL16Messages":{},"PageEdits":{"edits":[]},
            "Url":"",
            "Symbol":"",
            "PolicyNumber":"",
            "Mod":"",
            "MasterCompany":"",
            "Completed":""})
    };
ko.applyBindings(ViewModel, document.getElementById("main"));

var manager = new ResultsManager({
    gotDetailsCallback: function(result){
        ViewModel.result(result)
    },
    opened: function(){
        askForDetails();
    }
});

function askForDetails(){
    manager.getDetails(window.location.hash.substr(1));
}

},{"./results_manager.js":2}],2:[function(require,module,exports){
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
},{}]},{},[1]);

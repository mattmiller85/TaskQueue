var ResultsManager = require("./results_manager.js");

var ViewModel = {
        results: ko.observableArray(),
        
    }

var manager = new ResultsManager({
    latestResultsCallback: function(results){

    }
});
manager.askForLatestResults();
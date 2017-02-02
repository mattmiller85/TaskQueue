var ResultsManager = require("./results_manager.js");

var ViewModel = {
        results: ko.observableArray(),
        last_results: ko.observableArray()
    };
ko.applyBindings(ViewModel, document.getElementById("main"));

var manager = new ResultsManager({
    gotResultsCallback: function(results){
        if(results.length === 1){
            ViewModel.last_results.push(results[0]);
            setTimeout(function(){ ViewModel.last_results.shift(); }, 4000);
        }
        results.forEach(function(result) {
            ViewModel.results.unshift(result);
        });
    },
    opened: function(){
        askForLatest();
    }
});

function askForLatest(){
    manager.askForLatestResults();
}

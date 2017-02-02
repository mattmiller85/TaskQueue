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

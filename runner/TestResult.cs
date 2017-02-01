
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace PolicySanityChecker
{
    public class TestResult
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string PCName { get; set; }
        public bool Pass { get; set; }
        public bool Fail { get; set; }
        public bool IsErrorOutput { get; set; }
        public string Output { get; set; }
        public BsonDocument PremiumDifferences { get; set; }
        public BsonDocument IL16Messages { get; set; }
        public BsonDocument PageEdits { get; set; }
        public string Url { get; set; }
        public string Symbol { get; set; }
        public string PolicyNumber { get; set; }
        public string Mod { get; set; }
        public string MasterCompany { get; set; }
        public DateTime Completed { get; set; }
        public void SetDetails(){
        if(string.IsNullOrWhiteSpace(Output)){
            throw new Exception("must set output first");
        }

        var urlIndex = Output.IndexOf("FAILED ON");
            if(urlIndex > -1)
                Url = Output.Substring(urlIndex + 10, Output.Substring(urlIndex + 10).IndexOf(" ") + 1).Trim();

            var premiumDifferenceIndex = Output.IndexOf("PREMIUM_DIFFERENCE");
            if(premiumDifferenceIndex > -1){
                var premiumDifferenceEndIndex = Output.IndexOf("END_PREMIUM_DIFFERENCE");
                var premStartIndex = premiumDifferenceIndex + "PREMIUM_DIFFERENCE".Length;
                var premiumJSON = Output.Substring(premStartIndex, premiumDifferenceEndIndex - premStartIndex).Trim();
                PremiumDifferences = BsonDocument.Parse(premiumJSON);
            }

            var il16Index = Output.IndexOf("IL_16_MESSAGES");
            if(il16Index > -1){
                var il16EndIndex = Output.IndexOf("END_IL_16_MESSAGES");
                var il16StartIndex = il16Index + "IL_16_MESSAGES".Length;                
                var il16String = Output.Substring(il16StartIndex, il16EndIndex - il16StartIndex).Trim();
                var reader = new StringReader(il16String);

                var messageList = new List<string>();
                var messageLine = reader.ReadLine();
                while(messageLine != null)
                {
                    messageList.Add(messageLine);
                    messageLine = reader.ReadLine();
                }
                messageList = messageList.Where (l => !string.IsNullOrWhiteSpace(l)).ToList();
                messageList.RemoveAll(s => s.ToUpper().Contains("DESCRIPTION OF CHANGE"));
                IL16Messages = new { messages = messageList.Select(m => m.Trim()) }.ToBsonDocument();
            }

            var pageEditIndex = Output.IndexOf("PAGE_EDIT_BEGIN");
            if(pageEditIndex > -1){
                var pageEditEndIndex = Output.IndexOf("PAGE_EDIT_END");
                var pageEditStartIndex = pageEditIndex + "PAGE_EDIT_BEGIN".Length;                
                var pageEditString = Output.Substring(pageEditStartIndex, pageEditEndIndex - pageEditStartIndex).Trim();
                var reader = new StringReader(pageEditString);

                var messageList = new List<string>();
                var messageLine = reader.ReadLine();
                while(messageLine != null)
                {
                    messageList.Add(messageLine);
                    messageLine = reader.ReadLine();
                }
                messageList = messageList.Where (l => !string.IsNullOrWhiteSpace(l)).ToList();
                messageList.RemoveAll(s => s.ToLower().Contains("page had the following issues"));
                PageEdits = new { edits = messageList.Select(m => m.Trim()) }.ToBsonDocument();
            }
        }
    }
}
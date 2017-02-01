using MongoDB.Driver;

namespace PolicySanityChecker
{
    public class ResultLogger
    {
        IMongoClient _client;
        IMongoDatabase _database;
        
        public ResultLogger()
        {
            _client = new MongoClient("mongodb://exceptionless.model.grangeagent.com:27017");
            _database = _client.GetDatabase("feature_results");
        }

        public void Log(TestResult result)
        {
            var collection = _database.GetCollection<TestResult>("results");
            collection.InsertOne(result);
            //notify service w/result.Id
            
        }
    }
}
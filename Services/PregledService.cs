    using MongoDB.Driver;
    using Ambulanta.Models;
    using MongoDB.Bson;

    namespace Ambulanta.Services
    {
        public class PregledService : IPregledService
        {
            private readonly IMongoCollection<Pregled> _pregledi;

            public PregledService(IAmbulantaDatabaseSettings settings, IMongoClient mongoClient)
            {
                var database = mongoClient.GetDatabase(settings.DatabaseName);
                _pregledi = database.GetCollection<Pregled>(settings.PregledCollectionName);
            }
       

            public Pregled Create(Pregled pregled)
            {
                _pregledi.InsertOne(pregled);
                return pregled;
            }

            public List<Pregled> Get()
            {
                return _pregledi.Find(pregled => true).ToList();
            }

            public Pregled Get(ObjectId id)
            {
                return _pregledi.Find(pregled => pregled.Id == id).FirstOrDefault();
            }

            public void Remove(ObjectId id)
            {
                _pregledi.DeleteOne(pregled => pregled.Id == id);
            }

            public void Update(ObjectId id, Pregled pregled)
            {
                _pregledi.ReplaceOne(pregled => pregled.Id == id, pregled);
            }

            public List<Pregled> GetDoctorAppointmentsInDateRange(ObjectId idDoktora, DateTime startDate, DateTime endDate)
            {
                 var filter = Builders<Pregled>.Filter.And(
                    Builders<Pregled>.Filter.Eq(p => p.IdDoktora, idDoktora),
                    Builders<Pregled>.Filter.Gte(p => p.Datum, startDate),
                    Builders<Pregled>.Filter.Lte(p => p.Datum, endDate)
                );

                return _pregledi.Find(filter).ToList();
            }
        }
    }
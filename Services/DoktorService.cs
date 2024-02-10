using MongoDB.Driver;
using Ambulanta.Models;
using MongoDB.Bson;

namespace Ambulanta.Services
{
    public class DoktorService : IDoktorService
    {
        private readonly IMongoCollection<Doktor> _doktori;
        
        private readonly string _pepper;
        private readonly int _iteration;

        public DoktorService(IAmbulantaDatabaseSettings settings, IMongoClient mongoClient, IConfiguration config)
        {
            var database = mongoClient.GetDatabase(settings.DatabaseName);
            _doktori = database.GetCollection<Doktor>(settings.DoktorCollectionName);
            _pepper = config["PasswordHasher:Pepper"];
            _iteration = config.GetValue<int>("PasswordHasher:Iteration");
          
        }

        public Doktor Create(Doktor doktor)
        {
            _doktori.InsertOne(doktor);
            return doktor;
        }

        public List<Doktor> Get()
        {
            return _doktori.Find(doktor => true).ToList();
        }

        public Doktor Get(ObjectId id)
        {
            return _doktori.Find(doktor => doktor.Id == id).FirstOrDefault();
        }

        public async Task<Doktor> GetDocByEmailAsync(string email)
        {
            return await _doktori.Find(doktor => doktor.Email == email).FirstOrDefaultAsync();
        }
        public List<Doktor> GetBySpecijalizacija(Specijalizacija specijalizacija)
        {
            return _doktori.Find(d => d.Specijalizacija == specijalizacija).ToList();
        }        
        public Doktor GetAndUpdate(ObjectId doktorId, ObjectId pregledId)
        {
            return _doktori.FindOneAndUpdate(
            Builders<Doktor>.Filter.Eq(d => d.Id, doktorId),
            Builders<Doktor>.Update.AddToSet(d => d.PredstojeciPregledi, pregledId));
        }

        public void Remove(ObjectId id)
        {
            _doktori.DeleteOne(doktor => doktor.Id == id);
        }

        public void Update(ObjectId id, Doktor doktor)
        {
            _doktori.ReplaceOne(doktor => doktor.Id == id, doktor);
        }
        public async Task<bool> Register(RegistrationModelDoc resource)
        {
            var doktor = new Doktor
            {
                Ime = resource.Ime,
                Prezime = resource.Prezime,
                Adresa = resource.Adresa,
                BrojTelefona = resource.BrojTelefona,
                Role = UserRole.Doktor,
                Specijalizacija = resource.Specijalizacija,
                Email = resource.Email,
                PasswordSalt = PasswordHasher.GenerateSalt(),
            };
            doktor.Password = PasswordHasher.ComputeHash(resource.Password, doktor.PasswordSalt, _pepper, _iteration);
            _doktori.InsertOne(doktor);

            return true;
        }
        public bool RemoveAppointment(ObjectId doktorId, ObjectId appointmentId)
        {
            var filter = Builders<Doktor>.Filter.Eq(p => p.Id, doktorId);
            var update = Builders<Doktor>.Update.Pull(p => p.PredstojeciPregledi, appointmentId);

            var result = _doktori.UpdateOne(filter, update);

            return result.ModifiedCount > 0;
        }
    }
}
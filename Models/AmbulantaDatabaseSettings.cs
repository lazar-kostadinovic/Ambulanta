namespace Ambulanta.Models
{
    public class AmbulantaDatabaseSettings : IAmbulantaDatabaseSettings
    {
        public string PregledCollectionName { get; set; } = String.Empty;
        public string DoktorCollectionName { get; set; } = String.Empty;
        public string PacijentCollectionName { get; set; } = String.Empty;
        public string AdminCollectionName { get; set; } = String.Empty;
        public string ConnectionString { get; set; } = String.Empty;
        public string DatabaseName { get; set; } = String.Empty;
    }
}
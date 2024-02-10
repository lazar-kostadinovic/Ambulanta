namespace Ambulanta.Models
{
    public interface IAmbulantaDatabaseSettings
    {
        string DoktorCollectionName { get; set; }
        string PacijentCollectionName { get; set; }
        string PregledCollectionName { get; set; }
        string AdminCollectionName{get;set;}
        string ConnectionString { get; set; }
        string DatabaseName { get; set; }
    }
}
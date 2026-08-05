using Microsoft.Data.SqlClient;
using System.Data;

namespace UMS.Data
{
    public class DapperContext
    {
        private string _connectionString;

        public DapperContext(string connectionString)
        {
            _connectionString = connectionString;
        }
        public IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }
    }
}

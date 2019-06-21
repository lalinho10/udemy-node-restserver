/***********************************************************
 * Puerto
 ***********************************************************/

process.env.PORT = process.env.PORT || 3000;

/***********************************************************
 * Ambiente
 ***********************************************************/

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/***********************************************************
 * Conexión a BD
 ***********************************************************/

let dbConnection;

if (process.env.NODE_ENV === 'dev') {
    dbConnection = 'mongodb://localhost:27017/CafeDB';
} else {
    dbConnection = process.env.MONGO_DBCONNECTION;
}

process.env.DB_CONNECTION = dbConnection;
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
    dbConnection = 'mongodb+srv://lalinho10:o7vnwLdDKc0Wr4iv@cluster0-mpl51.mongodb.net/CafeDB';
}

process.env.DB_CONNECTION = dbConnection;
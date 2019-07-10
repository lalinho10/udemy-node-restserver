/***********************************************************
 * Puerto
 ***********************************************************/

process.env.PORT = process.env.PORT || 3000;

/***********************************************************
 * Ambiente
 ***********************************************************/

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/***********************************************************
 * Tiempo de expiración del JSON Web Token
 ***********************************************************/

process.env.JWT_EXP = 60 * 60 * 24 * 30;


/***********************************************************
 * Tiempo de expiración del JSON Web Token
 ***********************************************************/

process.env.JWT_SEED = process.env.JWT_SEED || 'Dev_JWT_SEED_123456_$'

/***********************************************************
 * Tiempo de expiración del JSON Web Token
 ***********************************************************/

process.env.CLIENT_ID = process.env.CLIENT_ID || '598158120125-qk2t2votq99fvatq4ssavdqr5hf28hcc.apps.googleusercontent.com'

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
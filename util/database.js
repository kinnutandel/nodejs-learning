const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {

  MongoClient
  .connect('mongodb+srv://kinnartandel:J9nc6FxLidlJ9a1R@cluster0.defqjrx.mongodb.net/?appName=Cluster0')
  .then(client => {
        console.log('Cheers! mongoDB connected.');
        _db = client.db();
        callback(client);
  })
  .catch(err => {
        console.error(err);
        throw err;
  });
};

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'No database found.'
};

//module.exports = mongoConnect;
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;


// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('node-complete', 'root', 'root', {
//     host: 'localhost',
//     dialect: 'mysql',
//     port: 8889
//   })


// module.exports = sequelize;
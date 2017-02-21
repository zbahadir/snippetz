/*
  Storage library built using nedb(no-sql javascript database)
  nedb helps to organize data in localstorage
*/

let Datastore = require("nedb");

//Get the home directory based on the platform
let HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

//Create an instance of the database class
//Provide the location of storage
let db = new Datastore({
  filename: `${HOME}/snipz/.snippetz`,
  autoload: true
});

//Insert a document
let insert = (document, callback) => {
  db.insert(document, (err, document) => {
    callback(err, document)
  });
}

//Find a document
let find = (query, callback) => {
  db.find(query, (err, documents) => {
    callback(err, documents);
  });
}

//Get all the documents
let findAll = (callback) => {
  db.find({}, (err, documents) => {
    callback(err, documents);
  })
}

//Remove a document
let remove = (query, callback) => {
  db.remove(query, (err, numRemoved) => {
    callback(err, numRemoved);
  });
}

//Update a document
let update = (query, data, options, callback) => {
  db.update(query, data, options, (err, numRemoved) => {
    callback(err, numRemoved);
  });
}

//Exporting the functions
module.exports = {
  insert: insert,
  findAll: findAll,
  find: find,
  remove: remove,
  update: update
}

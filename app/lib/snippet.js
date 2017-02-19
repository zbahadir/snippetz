/*
  Snippet wrapper on top of storage
  Specific to snippet tasks
*/

let storage = require("./util/storage");

//Store a snippet
let store = (snippetData, callback) => {
  storage.insert(snippetData, (err, document) => {
    callback(err, document);
  });
}

//Get all the snippets in the database
let getAll = (callback) => {
  storage.findAll((err, documents) => {
    callback(err, documents);
  });
}

//Get a single snippet in the database based on the query
let get = (query, callback) => {
  storage.find(query, (err, documents) => {
    callback(err, documents);
  });
}

//Delete a snippet in the database based on the query
let remove = (query, callback) => {
  storage.remove(query, (err, numRemoved) => {
    callback(err, numRemoved);
  });
}

//Update a snippet in the database with query & update data
let update = (query, data, options, callback) => {
  storage.update(query, data, options, (err, numRemoved) => {
    callback(err, numRemoved);
  });
}

//Exporting the functions
module.exports = {
  store: store,
  getAll: getAll,
  get: get,
  remove: remove,
  update: update
}

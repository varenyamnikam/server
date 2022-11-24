const MongoClient = require("mongodb").MongoClient;
// const databaseName = "novelseedsdb";
const databaseName = "jivaErp";
const cloudDb = "mongodb://localhost:27017/";
// const cloudDb =
//   "mongodb+srv://username1001:password1001@cluster0.oeiyl.mongodb.net/?retryWrites=true&w=majority";

module.exports = {
  // connectToServer: function (callback) {
  //   MongoClient.connect(cloudDb, { useNewUrlParser: true }, (error, result) => {
  //     if (error) {
  //       console.log("eroor!!!");
  //       console.log(error);
  //     }
  //     console.log("Connection Successful");

  //     // database = result.db("jivaErp");
  //     database = result.db("novelseedsdb");

  //     database
  //       .collection("adm_usermaster")
  //       .find({})
  //       .toArray((err, users) => {
  //         console.log(users[0]);
  //       });
  //     // return callback(error);
  //   });
  //   console.log()
  //   return database;
  // },
  // getDb: function () {
  //   return database;
  // },
  connectToServer: function (callback) {
    return cloudDb;
  },
  getDb: function () {
    return databaseName;
  },
};

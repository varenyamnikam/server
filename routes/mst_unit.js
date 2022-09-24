const express = require("express");
const router = express.Router();
var mongoUtil = require("../mongoUtil");
const cloudDb = mongoUtil.connectToServer();
const databaseName = mongoUtil.getDb();
console.log(databaseName, cloudDb);
const MongoClient = require("mongodb").MongoClient;

MongoClient.connect(cloudDb, { useNewUrlParser: true }, (error, result) => {
  if (error) {
    console.log("eroor!!!");
    console.log(error);
  }
  console.log("Connection Successful");

  database = result.db(databaseName);
});

router.get("/", verifyToken, (req, res) => {
  console.log("at /mst_unit*******");
  const userCompanyCode = req.query.userCompanyCode;

  database
    .collection("mst_unit")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, mst_unit) => {
      if (err) {
        res.send({ err: err });
        console.log(err);
      } else {
        res.json({
          mst_unit: mst_unit,
        });
        console.log(mst_unit);
      }
    });
});

module.exports = router;

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403); //forbidden
  }
}

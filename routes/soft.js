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
  database
    .collection("adm_softwareSettings")
    .find({})
    .toArray((err, users) => {
      // console.log(users);
    });

  database = result.db(databaseName);
});

router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  console.log("at /adm_softwareSettings*******", userCompanyCode);

  database
    .collection("adm_softwareSettings")
    .findOne({ userCompanyCode: userCompanyCode }, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        res.send({ result: result });
      }
    });
});
router.patch("/", verifyToken, (req, res) => {
  console.log("at patch of /soft*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const values = req.body.values;

  delete values._id;
  database.collection("adm_softwareSettings").updateOne(
    { userCompanyCode: userCompanyCode },
    {
      $set: {
        ...values,
        userCompanyCode: userCompanyCode,
        entryBy: userCode,
        entryOn: new Date(),
      },
    },
    { upsert: true },
    (err, data) => {
      if (err) {
        res.send({ err: err });
        console.log(err, "error");
      } else {
        // console.log(values.mktAreaCode, "updated");
        res.send({});
      }
    }
  );
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

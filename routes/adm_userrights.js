const express = require("express");
const router = express.Router();
var mongoUtil = require("../mongoUtil");
const cloudDb = mongoUtil.connectToServer();
const databaseName = mongoUtil.getDb();
const MongoClient = require("mongodb").MongoClient;

MongoClient.connect(cloudDb, { useNewUrlParser: true }, (error, result) => {
  if (error) {
    console.log("eroor!!!");
    console.log(error);
  }
  console.log("Connection Successful");

  // database = result.db("jivaErp");
  database = result.db(databaseName);

  // return callback(error);
});

router.post("/", verifyToken, (req, res) => {
  const values = req.body.values;
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  delete values._id;
  console.log(values);
  database.collection("adm_userrights").updateOne(
    {
      userCompanyCode: userCompanyCode,
      userCode: values.userCode,
      screenCode: values.screenCode,
    },
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
        res.send({});
      }
    }
  );
});

router.get("/", verifyToken, (req, res) => {
  console.log("post request recieved");
  database
    .collection("adm_userrights")
    .find({})
    .toArray((err, adm_userrights) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.json({ adm_userrights: adm_userrights });
      }
    });
});
router.put("/", verifyToken, (req, res) => {
  const values = req.body.values;
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = values.userCode;
  console.log(values);
  database.collection("adm_userrights").deleteMany(
    {
      userCompanyCode: userCompanyCode,
      userCode: values.userCode,
    },
    (err, data) => {
      if (err) {
        res.send({ err: err });
        console.log(err, "error");
      } else {
        res.send({});
      }
    }
  );
});

module.exports = router;

function verifyToken(req, res, next) {
  console.log(req.params);
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403); //forbidden
  }
}

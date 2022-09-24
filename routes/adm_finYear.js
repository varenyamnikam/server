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

  // database = result.db("jivaErp");
  database = result.db(databaseName);

  // return callback(error);
});
router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;

  console.log("at /adm_finYear*******", userCode, userCompanyCode, req.query);
  database
    .collection("adm_finYear")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, adm_finYear) => {
      if (err) {
        res.send({ err: err });
        console.log(err);
      } else {
        res.json({
          adm_finYear: adm_finYear,
        });
        console.log(adm_finYear);
      }
    });
});

router.post("/", verifyToken, (req, res) => {
  const values = req.body.input;
  console.log("at post of /adm_finYear*******", values.yearStartDate);
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  console.log(userCode);
  delete values._id;
  database.collection("adm_finYear").updateOne(
    { yearCode: values.yearCode, userCompanyCode: userCompanyCode },
    {
      $set: {
        ...values,
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
        console.log(values.yearCode, "inserted");
        res.send({});

      }
    }
  );
});
router.patch("/", verifyToken, (req, res) => {
  console.log("at patch delete of /adm_finYear*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const values = req.body.item;
  console.log(values);
  database.collection("adm_finYear").deleteOne(
    {
      userCompanyCode: userCompanyCode,
      yearCode: values.yearCode,
    },
    (err, data) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.send({
          msg: "entry deleted successfully",
        });
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

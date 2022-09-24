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
  console.log("get at /get_acadress");
  database
    .collection("mst_acadress")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, acadress) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.json({ acadress: acadress });
      }
    });
});
router.patch("/", verifyToken, (req, res) => {
  console.log("patch at /mst_acadress");

  const values = req.body;
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  console.log(values);
  database.collection("mst_acadress").updateOne(
    { acCode: values.acCode, addressNo: values.addressNo },
    {
      $set: {
        ...values,
        userCompanyCode: userCompanyCode,
        updateBy: userCode,
        updateOn: new Date(),
      },
    },
    { upsert: true },
    (err, data) => {
      if (err) {
        res.send({ err: err });
        console.log(err, "error");
      } else {        res.send({});

        console.log(values.acName, "inserted");
      }
    }
  );
});
router.post("/", verifyToken, (req, res) => {
  console.log("at deleteof mst_acAdress");
  const userCompanyCode = req.query.userCompanyCode;
  const values = req.body.values;
  database
    .collection("mst_acadress")
    .deleteMany(
      { userCompanyCode: userCompanyCode, acCode: values.acCode },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {        res.send({});

          console.log(values.acCode + "deleted");
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

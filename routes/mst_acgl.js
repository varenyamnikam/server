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
var ObjectId = require("mongodb").ObjectId;
router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;

  console.log("request recieved at get acgl");
  database
    .collection("mst_acTypes")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, mst_acTypes) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.json({ mst_acTypes: mst_acTypes });
        console.log(mst_acTypes);
      }
    });
});
router.put("/", verifyToken, (req, res) => {
  console.log("at put of /mst_acTypes*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  console.log(userCompanyCode);
  const values = req.body.values;
  database.collection("mst_acTypes").insertOne(
    {
      ...values,
      userCompanyCode: userCompanyCode,
      entryBy: userCode,
      entryOn: new Date(),
    },
    (err, data) => {
      if (err) {
        res.send({ err: err });
      } else {
        console.log(data);       

        res.status(200).send({ id: data.insertedId });
      }
    }
  );
});
router.patch("/", verifyToken, (req, res) => {
  console.log("at patch of /mst_acTypes*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const values = req.body.values;
  const id = values._id;
  console.log(values);
  delete values._id;
  database.collection("mst_acTypes").findOneAndUpdate(
    { _id: ObjectId(id), userCompanyCode: userCompanyCode },
    {
      $set: {
        ...values,
        userCompanyCode: userCompanyCode,
        updateBy: userCode,
        updateOn: new Date(),
      },
    },
    (err, data) => {
      if (err) {
        res.send({ err: err });
        console.log(err, "error");
      } else {
        console.log(values.acType, "updated");
        res.send({ message: `${values.acType} updated ` });
      }
    }
  );
});

router.post("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const values = req.body.item;
  database
    .collection("mst_acTypes")
    .deleteOne(
      { userCompanyCode: userCompanyCode, acType: values.acType },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {        res.send({});

          console.log(values.acType + "deleted");
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

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

router.get("/", verifyToken, (req, res) => {
  database
    .collection("adm_userrole")
    .find({})
    .toArray((err, adm_userrole) => {
      if (err) {
        res.send({ err: err });
      } else {
        database
          .collection("adm_userrights")
          .find({})
          .toArray((err, adm_userrights) => {
            if (err) {
              res.send({ err: err });
            } else {
              res.json({
                adm_userrole: adm_userrole,
                adm_userrights: adm_userrights,
              });
              // console.log(adm_userrole, adm_userrights);
            }
          });
      }
    });
});

router.put("/", verifyToken, (req, res) => {
  const roleCode = req.body.roleCode;
  const roleName = req.body.roleName;

  database.collection("adm_userrole").insertOne(
    {
      roleCode: roleCode,
      roleName: roleName,
    },
    (err, data) => {
      if (err) {
        // res.send({ err: err })
        res.json({ auth: true, message1: "Role Code already exist" });
      } else {
        // console.log(data.roleCode);
        res.json({ auth: true, message1: "Inserted" });
      }
    }
  );
});

router.post("/", verifyToken, (req, res) => {
  const roleCode = req.body.roleCode;
  // console.log(roleCode);
  database
    .collection("adm_userrights")
    .deleteOne({ roleCode: roleCode }, (err, data) => {
      if (err) {
        res.send({ err: err });
      }
    });

  database
    .collection("adm_userrole")
    .deleteOne({ roleCode: roleCode }, (err, data) => {
      if (err) {
        res.send({ err: err });
      }
    });

  database
    .collection("adm_userrole")
    .find({})
    .toArray((err, adm_userrole1) => {
      if (err) {
        res.send({ err: err });
      } else {
        // console.log(adm_userrole1);
        res.json({ auth: true, adm_userrole1: adm_userrole1 });
      }
    });
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

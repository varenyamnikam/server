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

  database = result.db(databaseName);
});

router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;

  console.log("at /mst_prodTypes*******", userCompanyCode);
  database
    .collection("mst_prodTypes")
    .find({
      $or: [
        {
          userCompanyCode: userCompanyCode,
        },
        {
          userCompanyCode: "all",
        },
      ],
    })
    .toArray((err, mst_prodTypes) => {
      if (err) {
        res.send({ err: err });
        console.log(err);
      } else {
        res.json({
          mst_prodTypes: mst_prodTypes,
        });
        console.log(mst_prodTypes);
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

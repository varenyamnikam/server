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
function calc(arr) {
  let inward = 0;
  let outward = 0;
  arr.map((item) => {
    outward = outward + Number(item.outwardQty);

    inward = inward + Number(item.inwardQty);
  });
  return inward - outward;
}
router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const prodCode = req.query.prodCode;
  const vouNo = req.query.vouNo;
  const useBatch = req.query.useBatch;
  console.log("at /batch*******", userCode, userCompanyCode, req.query);
  database
    .collection("inv_stockLedger")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, arr) => {
      if (err) {
        res.send({ err: err });
        console.log(err);
      } else {
        let raw = arr;
        arr = arr.filter((item) => item.prodCode == prodCode);
        arr = arr.filter(
          (item) => item.refNo !== vouNo || Number(item.qty) == 0
        );
        let final = [];
        if (useBatch == "Yes") {
          const batches = arr.reduce(function (buckets, item) {
            if (!buckets[item.batchNo]) buckets[item.batchNo] = [];
            buckets[item.batchNo].push(item);
            return buckets;
          }, {});
          console.log(batches);
          for (const [key, value] of Object.entries(batches)) {
            final.push({ batchNo: key, qty: calc(value) });
          }
          console.log(final, "yes");
          final = final.filter((item) => Number(item.qty) !== 0);
        } else {
          final = calc(arr);
          console.log(final, "no");
        }
        res.send({ stock: final, raw: raw });
      }
    });
});

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
module.exports = router;

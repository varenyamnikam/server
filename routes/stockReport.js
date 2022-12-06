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
function calcInOut(arr) {
  let inward = 0;
  let outward = 0;
  if (arr.length !== 0) {
    console.log(arr);
    arr.map((item) => {
      outward = outward + Number(item.outwardQty);

      inward = inward + Number(item.inwardQty);
    });
  }
  return { inward: inward, outward: outward };
}

router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const yearCode = req.query.yearCode;
  const branchCode = req.query.branchCode;

  console.log("post request recieved at stockReports", startDate, endDate);
  database
    .collection("mst_prodMaster")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, mst_prodMaster) => {
      if (err) {
        res.send({ err: err });
        console.log(err);
      } else {
        database
          .collection("inv_stockLedger")
          .find({ userCompanyCode: userCompanyCode })
          .toArray((err, stock) => {
            if (err) {
              res.send({ err: err });
            } else {
              let records = [];
              mst_prodMaster.map((prod, i) => {
                let prev = stock.filter(
                  (item) =>
                    new Date(item.vouDate).setHours(0, 0, 0, 0) <=
                      new Date(startDate).setHours(0, 0, 0, 0) &&
                    item.refNo.slice(6, 10) == yearCode &&
                    item.refNo.slice(0, 4) == branchCode &&
                    item.prodCode == prod.prodCode
                );
                if (prev.length !== 0) openingStock = calc(prev);
                else {
                  openingStock = 0;
                }
                let currentStock = stock.filter((item) => {
                  return (
                    new Date(item.vouDate).setHours(0, 0, 0, 0) >=
                      new Date(startDate).setHours(0, 0, 0, 0) &&
                    new Date(item.vouDate).setHours(0, 0, 0, 0) <=
                      new Date(endDate).setHours(0, 0, 0, 0) &&
                    item.refNo.slice(6, 10) == yearCode &&
                    item.refNo.slice(0, 4) == branchCode &&
                    item.prodCode == prod.prodCode
                  );
                });
                console.log(
                  "prev =>",
                  prev,
                  openingStock,
                  "current=>",
                  currentStock
                );
                let inwardOutward = calcInOut(currentStock);
                records[i] = {
                  prodCode: prod.prodCode,
                  openingStock: openingStock,
                  currentStock: inwardOutward,
                  reorderLevel: prod.reorderLevel,
                  prodName: prod.prodName,
                  UOM: prod.UOM,
                };
              });
              let monthlyStock = stock.filter((item) => {
                return (
                  new Date(item.vouDate).setHours(0, 0, 0, 0) >=
                    new Date(startDate).setHours(0, 0, 0, 0) &&
                  new Date(item.vouDate).setHours(0, 0, 0, 0) <=
                    new Date(endDate).setHours(0, 0, 0, 0) &&
                  item.refNo.slice(6, 10) == yearCode &&
                  item.refNo.slice(0, 4) == branchCode
                );
              });
              res.json({
                records: records,
                stock: monthlyStock,
              });
            }
          });
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

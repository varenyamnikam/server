const express = require("express");
const router = express.Router();
var mongoUtil = require("../mongoUtil");
const cloudDb = mongoUtil.connectToServer();
const databaseName = mongoUtil.getDb();
const MongoClient = require("mongodb").MongoClient;

MongoClient.connect(cloudDb, { useNewUrlParser: true }, (error, result) => {
  if (error) {
  }

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
  const useBatch = req.query.useBatch;

  console.log(
    "get request recieved at stockReports",
    startDate,
    endDate,
    yearCode,
    branchCode,
    useBatch
  );
  database
    .collection("mst_prodMaster")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, mst_prodMaster) => {
      if (err) {
        res.send({ err: err });
      } else {
        database
          .collection("inv_stockLedger")
          .find({ userCompanyCode: userCompanyCode })
          .toArray((err, stock) => {
            if (err) {
              res.send({ err: err });
            } else {
              let records = [];
              let monthlyStock;
              mst_prodMaster.map((prod, i) => {
                function groupBy(arr, property) {
                  return arr.reduce(function (memo, x) {
                    if (!memo[x[property]]) {
                      memo[x[property]] = [];
                    }
                    memo[x[property]].push(x);
                    return memo;
                  }, {});
                }
                let o = groupBy(stock, "batchNo");
                //if batchewise grp can be made
                if (o && useBatch == "Yes") {
                  Object.entries(o).map(([batchNo, batchStock]) => {
                    let prev = batchStock.filter(
                      (item) =>
                        new Date(item.vouDate).setUTCHours(0, 0, 0, 0) <=
                          new Date(startDate).setUTCHours(0, 0, 0, 0) &&
                        item.refNo.slice(6, 10) == yearCode &&
                        item.refNo.slice(0, 4) == branchCode &&
                        item.prodCode == prod.prodCode
                    );
                    if (prev.length !== 0) openingStock = calc(prev);
                    else {
                      openingStock = 0;
                    }
                    let stockOfTheMonth = batchStock.filter((item) => {
                      return (
                        new Date(item.vouDate).setUTCHours(0, 0, 0, 0) >=
                          new Date(startDate).setUTCHours(0, 0, 0, 0) &&
                        new Date(item.vouDate).setUTCHours(0, 0, 0, 0) <=
                          new Date(endDate).setUTCHours(0, 0, 0, 0) &&
                        item.refNo.slice(6, 10) == yearCode &&
                        item.refNo.slice(0, 4) == branchCode &&
                        item.prodCode == prod.prodCode
                      );
                    });
                    let inwardOutward = calcInOut(stockOfTheMonth);
                    records.push({
                      prodCode: prod.prodCode,
                      openingStock: openingStock,
                      currentStock: inwardOutward,
                      reorderLevel: prod.reorderLevel,
                      prodName: prod.prodName,
                      UOM: prod.UOM,
                      batchNo: batchNo,
                      stockOfTheMonth: stockOfTheMonth,
                    });
                    monthlyStock = batchStock.filter((item) => {
                      return (
                        new Date(item.vouDate).setUTCHours(0, 0, 0, 0) >=
                          new Date(startDate).setUTCHours(0, 0, 0, 0) &&
                        new Date(item.vouDate).setUTCHours(0, 0, 0, 0) <=
                          new Date(endDate).setUTCHours(0, 0, 0, 0) &&
                        item.refNo.slice(6, 10) == yearCode &&
                        item.refNo.slice(0, 4) == branchCode
                      );
                    });
                  });
                } //not able to group stock batchwise
                else {
                  let prev = stock.filter(
                    (item) =>
                      new Date(item.vouDate).setUTCHours(0, 0, 0, 0) <=
                        new Date(startDate).setUTCHours(0, 0, 0, 0) &&
                      item.refNo.slice(6, 10) == yearCode &&
                      item.refNo.slice(0, 4) == branchCode &&
                      item.prodCode == prod.prodCode
                  );

                  if (prev.length !== 0) openingStock = calc(prev);
                  else {
                    openingStock = 0;
                  }
                  let stockOfTheMonth = stock.filter((item) => {
                    return (
                      new Date(item.vouDate).setUTCHours(0, 0, 0, 0) >=
                        new Date(startDate).setUTCHours(0, 0, 0, 0) &&
                      new Date(item.vouDate).setUTCHours(0, 0, 0, 0) <=
                        new Date(endDate).setUTCHours(0, 0, 0, 0) &&
                      item.refNo.slice(6, 10) == yearCode &&
                      item.refNo.slice(0, 4) == branchCode &&
                      item.prodCode == prod.prodCode
                    );
                  });

                  //currentstock is batch wise sort it batch wise
                  let inwardOutward = calcInOut(stockOfTheMonth);
                  records.push({
                    prodCode: prod.prodCode,
                    openingStock: openingStock,
                    currentStock: inwardOutward,
                    reorderLevel: prod.reorderLevel,
                    prodName: prod.prodName,
                    UOM: prod.UOM,
                    batchNo: "no batch",
                    stockOfTheMonth: stockOfTheMonth,
                  });
                  monthlyStock = stock.filter((item) => {
                    return (
                      new Date(item.vouDate).setUTCHours(0, 0, 0, 0) >=
                        new Date(startDate).setUTCHours(0, 0, 0, 0) &&
                      new Date(item.vouDate).setUTCHours(0, 0, 0, 0) <=
                        new Date(endDate).setUTCHours(0, 0, 0, 0) &&
                      item.refNo.slice(6, 10) == yearCode &&
                      item.refNo.slice(0, 4) == branchCode
                    );
                  });
                }
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
router.post("/", verifyToken, (req, res) => {
  const userCompanyCode = req.body.userCompanyCode;
  const yearCode = req.body.yearCode;
  const branchCode = req.body.branchCode;
  const prodCode = req.body.prodCode;

  console.log(
    "post request recieved at stockReports",
    userCompanyCode,
    yearCode,
    branchCode,
    prodCode
  );

  database
    .collection("inv_stockLedger")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, product) => {
      if (err) {
        res.send({ err: err });
      } else {
        let prev = product.filter(
          (item) =>
            item.refNo.slice(6, 10) == yearCode &&
            item.refNo.slice(0, 4) == branchCode &&
            item.prodCode == prodCode
        );
        let stock = 0;
        if (prev.length !== 0) stock = calc(prev);
        res.json({
          stock: stock,
        });
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

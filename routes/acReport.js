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
  let credit = 0;
  let debit = 0;
  arr.map((item) => {
    debit = debit + Number(item.debit);

    credit = credit + Number(item.credit);
  });
  return debit - credit;
}
const arr = [
  "Propritor",
  "Partnership",
  "Cooperative",
  "Private Limited",
  "Limited",
  "Government",
];
router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const yearCode = req.query.yearCode;
  const branchCode = req.query.branchCode;
  const currentAcCode = req.query.acCode;

  console.log(
    "get request recieved at stockReports",
    startDate,
    endDate,
    currentAcCode
  );
  database
    .collection("mst_accounts")
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
    .toArray((err, mst_accounts) => {
      if (err) {
        res.send({ err: err });
        console.log(err);
      } else {
        database
          .collection("inv_acLedger")
          .find({ userCompanyCode: userCompanyCode })
          .toArray((err, transactions) => {
            if (err) {
              res.send({ err: err });
            } else {
              let prev = transactions.filter(
                (item) =>
                  new Date(item.vouDate).setUTCHours(0, 0, 0, 0) <
                    new Date(startDate).setUTCHours(0, 0, 0, 0) &&
                  item.vouNo.slice(6, 10) == yearCode &&
                  item.vouNo.slice(0, 4) == branchCode &&
                  item.acCode == currentAcCode
              );
              let openingBalance = 0;
              if (prev.length !== 0) openingBalance = calc(prev);

              let monthlyTrans = transactions.filter((item) => {
                return (
                  new Date(item.vouDate).setUTCHours(0, 0, 0, 0) >=
                    new Date(startDate).setUTCHours(0, 0, 0, 0) &&
                  new Date(item.vouDate).setUTCHours(0, 0, 0, 0) <=
                    new Date(endDate).setUTCHours(0, 0, 0, 0) &&
                  item.vouNo.slice(6, 10) == yearCode &&
                  item.vouNo.slice(0, 4) == branchCode &&
                  item.acCode == currentAcCode
                );
              });
              res.json({
                openingBalance: openingBalance,
                transactions: monthlyTrans,
                mst_accounts: mst_accounts,
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
  const acCode = req.body.acCode;

  console.log(
    "post request recieved at stockReports",
    userCompanyCode,
    yearCode,
    branchCode,
    acCode
  );

  database
    .collection("inv_acLedger")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, transactions) => {
      if (err) {
        res.send({ err: err });
      } else {
        let prev = transactions.filter(
          (item) =>
            new Date(item.vouDate).setUTCHours(0, 0, 0, 0) <=
              new Date().setUTCHours(0, 0, 0, 0) &&
            item.vouNo.slice(6, 10) == yearCode &&
            item.vouNo.slice(0, 4) == branchCode &&
            item.acCode == acCode
        );
        let balance = 0;
        if (prev.length !== 0) balance = calc(prev);
        console.log(prev, balance);
        res.json({
          balance: balance,
        });
      }
    });
});
router.patch("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const yearCode = req.query.yearCode;
  const branchCode = req.query.branchCode;
  const docCodes = req.body.docCodes;
  console.log(req.body.docCodes);
  console.log("patch request recieved at stockReports", startDate, endDate);
  database
    .collection("mst_accounts")
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
    .toArray((err, mst_accounts) => {
      if (err) {
        res.send({ err: err });
        console.log(err);
      } else {
        database
          .collection("inv_acLedger")
          .find({ userCompanyCode: userCompanyCode })
          .toArray((err, inv_acLedger) => {
            if (err) {
              res.send({ err: err });
            } else {
              let acLedger = inv_acLedger.filter(
                (item) =>
                  new Date(item.vouDate).setUTCHours(0, 0, 0, 0) >=
                    new Date(startDate).setUTCHours(0, 0, 0, 0) &&
                  new Date(item.vouDate).setUTCHours(0, 0, 0, 0) <=
                    new Date(endDate).setUTCHours(0, 0, 0, 0) &&
                  item.vouNo.slice(6, 10) == yearCode &&
                  item.vouNo.slice(0, 4) == branchCode &&
                  docCodes.includes(item.docCode)
              );
              res.json({
                acLedger: acLedger,
                mst_accounts: mst_accounts,
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

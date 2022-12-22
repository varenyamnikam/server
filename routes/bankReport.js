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
    debit = credit + Number(item.debit);

    credit = debit + Number(item.credit);
  });
  return debit - credit;
}
function calcInOut(arr) {
  let credit = 0;
  let debit = 0;
  if (arr.length !== 0) {
    console.log(arr);
    arr.map((item) => {
      debit = debit + Number(item.debit);

      credit = credit + Number(item.credit);
    });
  }
  return { credit: credit, debit: debit };
}

router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const yearCode = req.query.yearCode;
  const branchCode = req.query.branchCode;
  const currentAcCode = req.query.acCode;
  const docCode1 = req.query.docCode1;
  const docCode2 = req.query.docCode2;
  console.log(
    "post request recieved at bankreport",
    startDate,
    endDate,
    currentAcCode
  );
  database
    .collection("mst_accounts")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, mst_accounts) => {
      if (err) {
        res.send({ err: err });
        console.log(err);
      } else {
        database
          .collection("inv_acLedger")
          .find({
            $or: [
              {
                docCode: docCode1,
              },
              {
                docCode: docCode2,
              },
              {
                docCode: "CV",
              },
            ],
          })
          .toArray((err, transactions) => {
            if (err) {
              res.send({ err: err });
            } else {
              let prev = transactions
                .filter(
                  (item) =>
                    new Date(item.vouDate).setHours(0, 0, 0, 0) <
                      new Date(startDate).setHours(0, 0, 0, 0) &&
                    item.vouNo.slice(6, 10) == yearCode &&
                    item.vouNo.slice(0, 4) == branchCode &&
                    item.acCode == currentAcCode
                )
                .map((item) => item.vouNo);
              //pullout vouNo of all previous transaction of a bank's acCode
              console.log(prev);
              function checkSameVouOrNot(code, arr) {
                let x = false;
                arr.map((item) => {
                  if (item == code) x = true;
                });
                return x;
              }
              //take all voucher of same vouNo except that of the bank i.e voucher of opposite party
              let prevVouchers = transactions.filter(
                (item) =>
                  item.acCode != currentAcCode &&
                  checkSameVouOrNot(item.vouNo, prev)
              );
              console.log(prevVouchers);
              let openingBalance = 0;
              //calculate
              openingBalance = calc(prevVouchers);
              let monthlyTrans = transactions
                .filter((item) => {
                  return (
                    new Date(item.vouDate).setHours(0, 0, 0, 0) >=
                      new Date(startDate).setHours(0, 0, 0, 0) &&
                    new Date(item.vouDate).setHours(0, 0, 0, 0) <=
                      new Date(endDate).setHours(0, 0, 0, 0) &&
                    item.vouNo.slice(6, 10) == yearCode &&
                    item.vouNo.slice(0, 4) == branchCode &&
                    item.acCode == currentAcCode
                  );
                })
                .map((item) => item.vouNo);
              console.log("monthlyTrans=>", monthlyTrans, transactions);
              let currentVouchers = transactions.filter(
                (item) =>
                  item.acCode != currentAcCode &&
                  checkSameVouOrNot(item.vouNo, monthlyTrans)
              );

              res.json({
                mst_accounts: mst_accounts,
                openingBalance: openingBalance,
                transactions: currentVouchers,
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

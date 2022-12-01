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
const ledgerArr = [
  { code: "partyCode", feild: "netAmount", type: "debit" },
  { code: "G1001", feild: "qrTotal", type: "credit" },
  { code: "G1002", feild: "discountTotal", type: "debit" },
  { code: "G1003", feild: "cgstTotal", type: "credit" },
  { code: "G1004", feild: "sgstTotal", type: "credit" },
  { code: "G1005", feild: "igstTotal", type: "credit" },
  { code: "G1006", feild: "cessTotal", type: "credit" },
  { code: "G1007", feild: "billDis", type: "debit" },
  { code: "G1008", feild: "roundOff", type: "both" },
];
const fullForms = [
  { short: "QT", full: "Quotation" },
  { short: "SO", full: "Sale Order" },
  { short: "PI", full: "Profarma Invoice" },
  { short: "DC", full: "Delivery Challan" },
  { short: "SI", full: "Sale Invoice" },
  { short: "SR", full: "Sale Return" },
  { short: "PO", full: "Purchase Order" },
  { short: "GR", full: "Good Receipt Note" },
  { short: "PV", full: "Purchase Voucher" },
  { short: "PR", full: "Purchase Return" },
  { short: "CN", full: "Credit Note" },
  { short: "DN", full: "Debit Note" },
];
function getFullForm(voucher) {
  const full = fullForms.find((item) => item.short == voucher.docCode);
  return full.full + "No" + `${voucher.vouNo}`;
}
router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const date = req.query.date;
  const docCode = req.query.docCode;
  const yearCode = req.query.yearCode;
  const branchCode = req.query.branchCode;

  console.log(
    "post request recieved at get ledger",
    date,
    yearCode,
    branchCode
  );
  database
    .collection("mst_accounts")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, mst_accounts) => {
      if (err) {
        res.send({ err: err });
      } else {
        database
          .collection("inv_acLedger")
          .find({ userCompanyCode: userCompanyCode, docCode: docCode })
          .toArray((err, inv_voucher) => {
            if (err) {
              res.send({ err: err });
            } else {
              const voucher = inv_voucher.filter((item) => {
                console.log(
                  "hi********************8",
                  new Date(item.vouDate),
                  new Date(date),
                  new Date(item.vouDate).setHours(0, 0, 0, 0) >=
                    new Date(date).setHours(0, 0, 0, 0),

                  item.vouNo.slice(6, 10) == yearCode,
                  item.vouNo.slice(0, 4) == branchCode,

                  new Date(date)
                );
                return (
                  new Date(item.vouDate).setHours(0, 0, 0, 0) >=
                    new Date(date).setHours(0, 0, 0, 0) &&
                  item.vouNo.slice(6, 10) == yearCode
                );
              });
              console.log(new Date(date).setHours(0, 0, 0, 0));
              console.log(inv_voucher.length, voucher.length);

              // console.log(
              //   voucher.length,
              //   new Date(
              //     inv_voucher[
              //       inv_voucher.length - 1
              //     ].vouDate
              //   ).setHours(0,0,0,0) >= new Date(date).setHours(0,0,0,0),
              //   voucher[voucher.length - 1].vouDate
              // );

              res.json({
                mst_accounts: mst_accounts,
                inv_voucher: voucher,
              });
            }
          });
      }
    });
});
router.put("/", verifyToken, (req, res) => {
  console.log("at put of acc*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const values = req.body.obj.values;
  let itemList = req.body.obj.itemList;

  database
    .collection("inv_acLedger")
    .find({ docCode: values.docCode, userCompanyCode: userCompanyCode })
    .toArray((err, inv_voucher) => {
      if (err) {
        res.send({ err: err });
      } else {
        let usrcdarr = [];
        console.log(inv_voucher);
        inv_voucher.map((item) => {
          if (item.vouNo.slice(0, item.vouNo.length - 4) == values.vouNo) {
            usrcdarr.push(parseInt(item.vno));
          }
        });
        function getMax(usrcdarr) {
          let x = 0;
          usrcdarr.map((item) => {
            if (item > x) {
              x = item;
            }
          });
          console.log(x);
          return x;
        }
        const zeroPad = (num, places) => String(num).padStart(places, "0");

        // let max = parseInt(getMax(usrcdarr));
        let max;
        parseInt(getMax(usrcdarr)) === 0
          ? (max = "0001")
          : (max = zeroPad(getMax(usrcdarr) + 1, 4));
        console.log(usrcdarr, String(getMax(usrcdarr) + 1));

        itemList = itemList.map((item) => {
          return {
            ...item,
            vouNo: values.vouNo + max,
            acName: "",
            vno: max,
            entryBy: userCode,
            entryOn: new Date(),
            userCompanyCode: userCompanyCode,
          };
        });
        database
          .collection("inv_acLedger")
          .insertMany(itemList, (err, data) => {
            if (err) {
              res.send({ err: err });
              console.log(err);
            } else {
              res.send({
                itemList: itemList,
                max: values.vouNo + max,
              });
            }
          });
      }
    });
});

router.patch("/", verifyToken, (req, res) => {
  console.log("at patch of /inv_acc*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const values = req.body.obj.values;
  let itemList = req.body.obj.itemList;
  itemList = itemList.map((item) => {
    delete item._id;
    return {
      ...item,
      acName: "",
      updateBy: userCode,
      updateOn: new Date(),
    };
  });

  database
    .collection("inv_acLedger")
    .deleteMany(
      { userCompanyCode: userCompanyCode, vouNo: values.vouNo },
      (err, data) => {
        if (err) {
          res.send({ err: err });
          console.log(err);
        } else {
          database
            .collection("inv_acLedger")
            .insertMany(itemList, (err, data) => {
              if (err) {
                res.send({ err: err });
                console.log(err);
              } else {
                res.send({
                  itemList: itemList,
                });
              }
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

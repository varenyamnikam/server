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
            console.log(item);
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
          raw = raw.filter(
            (item) => item.refType == "OP" || item.refType == "AJ"
          );
        }

        database
          .collection("mst_prodMaster")
          .find({ userCompanyCode: userCompanyCode })
          .toArray((err, mst_prodMaster) => {
            if (err) {
              res.send({ err: err });
              console.log(err);
            } else {
              let prod = [];
              if (useBatch == "idk")
                mst_prodMaster.map((item) => {
                  prod.push(item);
                });
              res.send({ stock: final, raw: raw, prod: prod });
            }
          });
      }
    });
});
router.put("/", verifyToken, (req, res) => {
  console.log("at put of /inv_both*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const values = req.body.obj.input;
  const input = req.body.obj.input;
  delete values.prodName;
  database
    .collection("inv_stockLedger")
    .find({ userCompanyCode: userCompanyCode, refType: values.refType })
    .toArray((err, inv_voucher) => {
      if (err) {
        res.send({ err: err });
      } else {
        let usrcdarr = [];
        inv_voucher.map((item) => {
          if (item.refNo.slice(0, item.refNo.length - 4) == values.refNo) {
            usrcdarr.push(parseInt(item.refNo.slice(10, 14)));
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
        console.log(usrcdarr, String(getMax(usrcdarr) + 1).length);
        database.collection("inv_stockLedger").insertOne(
          {
            ...values,
            refNo: values.refNo + max,
            userCompanyCode: userCompanyCode,
            entryBy: userCode,
            entryOn: new Date(),
          },
          (err, data) => {
            if (err) {
              res.send({ err: err });
              console.log(err);
            } else {
              res.send({
                values: {
                  ...input,
                  refNo: values.refNo + max,
                  userCompanyCode: userCompanyCode,
                  entryBy: userCode,
                  entryOn: new Date(),
                },
              });
            }
          }
        );
      }
    });
});
router.patch("/", verifyToken, (req, res) => {
  console.log("at put of /inv_both*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const values = req.body.obj.input;
  const input = req.body.obj.input;
  console.log(values);
  delete values.prodName;
  delete values._id;
  delete values.getDate;
  database.collection("inv_stockLedger").updateOne(
    { refNo: values.refNo, userCompanyCode: userCompanyCode },
    {
      $set: {
        ...values,
        userCompanyCode: userCompanyCode,
        refNo: values.refNo,
        updateBy: userCode,
        entryOn: new Date(),
      },
    },
    (err, data) => {
      if (err) {
        res.send({ err: err });
        console.log(err);
      } else {
        res.send({
          values: { ...input, entryOn: new Date() },
        });
      }
    }
  );
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

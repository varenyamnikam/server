const express = require("express");
const router = express.Router();
var mongoUtil = require("../mongoUtil");
const cloudDb = mongoUtil.connectToServer();
const databaseName = mongoUtil.getDb();
const MongoClient = require("mongodb").MongoClient;
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: [PORT],
    methods: ["GET", "POST", "PATCH", "PUT"],
    credentials: true,
  })
);

MongoClient.connect(cloudDb, { useNewUrlParser: true }, (error, result) => {
  if (error) {
    console.log("eroor!!!");
    console.log(error);
  }
  console.log("Connection Successful");

  database = result.db(databaseName);
});
router.get("/", verifyToken, (req, res) => {
  console.log("at /mst_paymentTerm*******");
  database
    .collection("mst_paymentTerm")
    .find({})
    .toArray((err, mst_paymentTerm) => {
      if (err) {
        res.send({ err: err });
        console.log(err);
      } else {
        res.json({
          mst_paymentTerm: mst_paymentTerm,
        });
      }
    });
});
router.put("/", verifyToken, (req, res) => {
  console.log("at post of /mst_paymentTerm*******");
  const userCompanyCode = req.query.userCompanyCode;
  const values = req.body.values;
  database
    .collection("mst_paymentTerm")
    .find({})
    .toArray((err, mst_paymentTerm) => {
      if (err) {
        res.send({ err: err });
      } else {
        let usrcdarr = [];
        mst_paymentTerm.map((item) => {
          usrcdarr.push(item.paymentTermsCode);
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
        const max = parseInt(getMax(usrcdarr));
        console.log(usrcdarr, max);
        database.collection("mst_paymentTerm").insertOne(
          {
            ...values,
            paymentTermsCode: JSON.stringify(max + 1),
            userCompanyCode: userCompanyCode,
          },
          (err, data) => {
            if (err) {
              res.send({ err: err });
            } else {
              console.log(parseInt(max) + 1, parseInt(max + 1));
              res.send({
                values: {
                  ...values,
                  paymentTermsCode: JSON.stringify(max + 1),
                },
                paymentTermsCode: max + 1,
              });
            }
          }
        );
      }
    });
});
router.patch("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const values = req.body.values;
  console.log("at patch of /mst_paymentTerm*******", values.paymentTermsCode);
  delete values._id;
  database
    .collection("mst_paymentTerm")
    .updateOne(
      {
        paymentTermsCode: values.paymentTermsCode,
        userCompanyCode: userCompanyCode,
      },
      { $set: { ...values } },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          console.log(values.paymentTermsCode + "updated");
          res.send({ msg: `${values.paymentTermsCode} updated succesfully` });
        }
      }
    );
});
router.post("/", verifyToken, (req, res) => {
  console.log("at deleteof mst_acAdress");
  const userCompanyCode = req.query.userCompanyCode;
  const values = req.body.item;
  database
    .collection("mst_paymentTerm")
    .deleteOne(
      {
        userCompanyCode: userCompanyCode,
        paymentTermsCode: values.paymentTermsCode,
      },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          res.send({});

          console.log(values.paymentTermsCode + "deleted");
        }
      }
    );
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

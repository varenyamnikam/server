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
  console.log("at /mst_prodMaster*******");
  const userCompanyCode = req.query.userCompanyCode;

  database
    .collection("mst_prodMaster")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, mst_prodMaster) => {
      if (err) {
        res.send({ err: err });
        console.log(err);
      } else {
        res.json({
          mst_prodMaster: mst_prodMaster,
        });
      }
    });
});
router.post("/", verifyToken, (req, res) => {
  console.log("at post of /mst_prodMaster*******");
  const userCompanyCode = req.query.userCompanyCode;
  const values = req.body.input;
  database
    .collection("mst_prodMaster")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, mst_prodMaster) => {
      if (err) {
        res.send({ err: err });
      } else {
        let usrcdarr = [];
        mst_prodMaster.map((item) => {
          usrcdarr.push(item.prodCode);
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
        database.collection("mst_prodMaster").insertOne(
          {
            ...values,
            prodCode: JSON.stringify(max + 1),
            userCompanyCode: userCompanyCode,
          },
          (err, data) => {
            if (err) {
              res.send({ err: err });
            } else {
              console.log(parseInt(max) + 1, parseInt(max + 1));
              res.send({
                values: { ...values, prodCode: JSON.stringify(max + 1) },
                prodCode: max + 1,
              });
            }
          }
        );
      }
    });
});
router.patch("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const values = req.body.input;
  console.log("at patch of /mst_prodMaster*******", values.prodCode);
  delete values._id;
  database
    .collection("mst_prodMaster")
    .updateOne(
      { prodCode: values.prodCode, userCompanyCode: userCompanyCode },
      { $set: { ...values } },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          console.log(values.prodCode + "updated");
          res.send({ msg: `${values.prodCode} updated succesfully` });
        }
      }
    );
});
router.put("/", verifyToken, (req, res) => {
  console.log("at deleteof mst_acAdress");
  const userCompanyCode = req.query.userCompanyCode;
  const values = req.body.item;
  database
    .collection("mst_prodMaster")
    .deleteOne(
      { userCompanyCode: userCompanyCode, prodCode: values.prodCode },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          console.log(values.prodCode + "deleted");
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

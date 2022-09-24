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
router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  console.log("at /adm_branch*******", typeof userCompanyCode);
  database
    .collection("adm_branch")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, adm_branch) => {
      if (err) {
        res.send({ err: err });
        console.log(err);
      } else {
        res.json({
          adm_branch: adm_branch,
        });
        console.log(adm_branch);
      }
    });
});
router.post("/", verifyToken, (req, res) => {
  console.log("at post of adm_branch*****");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const values = req.body.input;
  delete values.acBranchName;
  database
    .collection("adm_branch")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, adm_branch) => {
      if (err) {
        res.send({ err: err });
      } else {
        let usrcdarr = [];
        adm_branch.map((item) => {
          usrcdarr.push(item.branchCode);
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
        let max = parseInt(getMax(usrcdarr));
        parseInt(getMax(usrcdarr)) === 0
          ? (max = 1000)
          : (max = parseInt(getMax(usrcdarr)));
        console.log(usrcdarr, max);
        database.collection("adm_branch").insertOne(
          {
            ...values,
            branchCode: JSON.stringify(parseInt(max) + 1),
            branchValue: values.branchName.replace(/\s/g, ""),
            userCompanyCode: userCompanyCode,
            entryBy: userCode,
            entryOn: new Date(),
          },
          (err, data) => {
            if (err) {
              res.send({ err: err });
            } else {
              console.log(values.branchName.replace(/\s/g, ""));
              res.send({
                values: {
                  ...values,
                  branchCode: JSON.stringify(parseInt(max) + 1),
                },
                branchCode: JSON.stringify(parseInt(max) + 1),
              });
            }
          }
        );
      }
    });
});
router.patch("/", verifyToken, (req, res) => {
  console.log("at patch of adm_branch*****");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const values = req.body.input;
  delete values._id;
  delete values.acBranchName;

  console.log(values, userCompanyCode);
  // const id = req.body._id;
  database.collection("adm_branch").updateOne(
    { userCompanyCode: userCompanyCode, branchCode: values.branchCode },
    {
      $set: {
        ...values,
        updateBy: userCode,
        updateOn: new Date(),
      },
    },
    (err, data) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.send({});
      }
    }
  );
});
router.put("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const values = req.body.item;
  console.log("at patch of adm_branch*****", values);
  const branchCode = values.branchCode;
  database
    .collection("adm_branch")
    .deleteOne(
      { userCompanyCode: userCompanyCode, branchCode: branchCode },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          console.log(branchCode + " deleted");
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

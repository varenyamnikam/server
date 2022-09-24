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
  const userCode = req.query.userCode;

  console.log("post request recieved at get accounts");
  database
    .collection("mst_acglgroup")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, mst_acglgroup) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.json({ mst_acglgroup: mst_acglgroup });
      }
    });
});
router.put("/", verifyToken, (req, res) => {
  console.log("at put of /mst_acglgroup*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  console.log(userCompanyCode);
  const values = req.body.values;
  delete values.parentGroupName;

  database
    .collection("mst_acglgroup")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, mst_acglgroup) => {
      if (err) {
        res.send({ err: err });
      } else {
        let usrcdarr = [];
        mst_acglgroup.map((item) => {
          usrcdarr.push(parseInt(item.acGroupCode.match(/(\d+)/)[0]));
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
          ? (max = 10000)
          : (max = parseInt(getMax(usrcdarr)));
        console.log(usrcdarr, max);
        database.collection("mst_acglgroup").insertOne(
          {
            ...values,
            acGroupCode: "A" + JSON.stringify(parseInt(max) + 1),
            userCompanyCode: userCompanyCode,
            entryBy: userCode,
            entryOn: new Date(),
          },
          (err, data) => {
            if (err) {
              res.send({ err: err });
            } else {
              console.log(parseInt(max) + 1, parseInt(max + 1));
              res.status(200).json({
                values: {
                  ...values,
                  acGroupCode: "A" + JSON.stringify(parseInt(max) + 1),
                },
              });
            }
          }
        );
      }
    });
});
router.patch("/", verifyToken, (req, res) => {
  console.log("at patch of /mst_acglgroup*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  console.log(userCode);
  const values = req.body.values;
  const acGroupCode = values.acGroupCode;
  delete values._id;
  delete values.parentGroupName;
  database.collection("mst_acglgroup").updateOne(
    { acGroupCode: acGroupCode, userCompanyCode: userCompanyCode },
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
        console.log(err, "error");
      } else {
        console.log(values.acGroupCode, "updated");
        res.send({ message: `${values.acGroupCode} updated ` });
      }
    }
  );
});

router.post("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const values = req.body.item;
  database
    .collection("mst_acglgroup")
    .deleteOne(
      { userCompanyCode: userCompanyCode, acGroupCode: values.acGroupCode },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          console.log(values.acGroupCode + "deleted");
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

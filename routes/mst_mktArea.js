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

});
router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  console.log("at get of /mktArea*******");
  database
    .collection("mst_mktArea")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, mst_mktArea) => {
      if (err) {
        res.send({ err: err });
        console.log(err);
      } else {
        res.json({
          mst_mktArea: mst_mktArea,
        });
      }
    });
});
router.put("/", verifyToken, (req, res) => {
  console.log("at post of /mst_mktArea*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  console.log(userCompanyCode);
  const values = req.body.input;
  const parent = values.parent;
  console.log(values, parent, values.parent);
  database
    .collection("mst_mktArea")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, mst_mktArea) => {
      if (err) {
        res.send({ err: err });
      } else {
        let usrcdarr = [];
        mst_mktArea.map((item) => {
          usrcdarr.push(item.mktAreaCode);
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
          ? (max = 5000)
          : (max = parseInt(getMax(usrcdarr)));
        console.log(usrcdarr, max);
        // delete values.parent;
        database.collection("mst_mktArea").insertOne(
          {
            mktArea: values.mktArea,
            parentAreaCode: values.parentAreaCode,
            child: values.child,
            assignTo: values.assignTo,
            mktAreaCode: JSON.stringify(parseInt(max) + 1),
            userCompanyCode: userCompanyCode,
            entryBy: userCode,
            entryOn: new Date(),
          },
          (err, data) => {
            if (err) {
              res.send({ err: err });
            } else {
              // console.log(parent.child);
              parent.child.push(JSON.stringify(parseInt(max) + 1));
              delete parent._id;
              database.collection("mst_mktArea").updateOne(
                {
                  mktAreaCode: values.parentAreaCode,
                  userCompanyCode: userCompanyCode,
                },
                {
                  $set: {
                    ...parent,
                    updateBy: userCode,
                    updateOn: new Date(),
                  },
                },
                (err, data) => {
                  if (err) {
                    res.send({ err: err });
                    console.log(err, "error");
                  } else {
                    database
                      .collection("mst_mktArea")
                      .find({ userCompanyCode: userCompanyCode })
                      .toArray((err, mst_mktArea) => {
                        if (err) {
                          res.send({ err: err });
                          console.log(err);
                        } else {
                          res.json({
                            mst_mktArea: mst_mktArea,
                          });
                          console.log(mst_mktArea);
                        }
                      });
                  }
                }
              );
            }
            // res.json({
            //   mst_mktArea: mst_mktArea,
            // });
          }
        );
      }
    });
});
router.patch("/", verifyToken, (req, res) => {
  console.log("at patch of /mktArea*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const values = req.body.input;

  delete values._id;
  database.collection("mst_mktArea").updateOne(
    { mktAreaCode: values.mktAreaCode, userCompanyCode: userCompanyCode },
    {
      $set: {
        mktArea: values.mktArea,
        assignTo: values.assignTo,
        userCompanyCode: userCompanyCode,
        updateBy: userCode,
        updateOn: new Date(),
      },
    },
    (err, data) => {
      if (err) {
        res.send({ err: err });
        console.log(err, "error");
      } else {
        console.log(values.mktAreaCode, "updated");

        database
          .collection("mst_mktArea")
          .find({
            mktAreaCode: values.mktAreaCode,
            userCompanyCode: userCompanyCode,
          })
          .toArray((err, mst_mktArea) => {
            if (err) {
              res.send({ err: err });
              console.log(err);
            } else {
              res.send({ values: mst_mktArea[0] });
              console.log(mst_mktArea);
            }
          });
      }
    }
  );
});
router.post("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;

  const values = req.body.input;
  database
    .collection("mst_mktArea")
    .deleteOne(
      { userCompanyCode: userCompanyCode, mktAreaCode: mktAreaCode },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          database
            .collection("mst_mktArea")
            .find({ userCompanyCode: userCompanyCode })
            .toArray((err, mst_mktArea) => {
              if (err) {
                res.send({ err: err });
                console.log(err);
              } else {
                res.json({
                  mst_mktArea: mst_mktArea,
                });
                console.log(mst_mktArea);
              }
            });
          console.log(mktAreaCode + "user deleted");
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

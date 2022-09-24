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

  database
    .collection("adm_usermaster")
    .find({})
    .toArray((err, users) => {
      console.log(users[0]);
    });
  // return callback(error);
});
router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;

  console.log("at get of /adm_usermaster*******", userCode, database);
  database
    .collection("adm_usermaster")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, adm_usermaster) => {
      if (err) {
        res.send({ err: err });
        console.log(err);
      } else {
        database
          .collection("adm_finYear")
          .find({ userCompanyCode: userCompanyCode })
          .toArray((err, adm_finYear) => {
            if (err) {
              res.send({ err: err });
              console.log(err);
            } else {
              database
                .collection("adm_branch")
                .find({ userCompanyCode: userCompanyCode })
                .toArray((err, adm_branch) => {
                  if (err) {
                    res.send({ err: err });
                    console.log(err);
                  } else {
                    database
                      .collection("adm_userrights")
                      .find({ userCompanyCode: userCompanyCode })
                      .toArray((err, adm_userrights) => {
                        if (err) {
                          res.send({ err: err });
                          console.log(err);
                        } else {
                          res.json({
                            adm_usermaster: adm_usermaster,
                            adm_branch: adm_branch,
                            adm_finYear: adm_finYear,
                            adm_userrights: adm_userrights,
                          });
                          console.log(adm_usermaster);
                        }
                      });
                  }
                });
            }
          });
      }
    });
});
router.post("/", verifyToken, (req, res) => {
  console.log("at post of /adm_usermaster*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  console.log(userCompanyCode);
  const values = req.body.values;
  delete values.DefaultBranchName;
  database
    .collection("adm_usermaster")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, adm_usermaster) => {
      if (err) {
        res.send({ err: err });
      } else {
        let usrcdarr = [];
        adm_usermaster.map((item) => {
          usrcdarr.push(item.userCode);
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
        database.collection("adm_usermaster").insertOne(
          {
            ...values,
            userCode: JSON.stringify(parseInt(max) + 1),
            userCompanyCode: userCompanyCode,
            entryBy: userCode,
            entryOn: new Date(),
          },
          (err, data) => {
            if (err) {
              res.send({ err: err });
            } else {
              console.log(parseInt(max) + 1, parseInt(max + 1));
              res.send({
                values: { ...values, userCode: parseInt(max) + 1 },
                userCode: max + 1,
              });
            }
          }
        );
      }
    });
});
router.patch("/", verifyToken, (req, res) => {
  console.log("at patch of /adm_userMastwr*******");
  const userCompanyCode = req.query.userCompanyCode;
  const usr = req.query.userCode;
  const values = req.body.values;
  const userCode = values.userCode;
  console.log(userCompanyCode, userCode);

  delete values.DefaultBranchName;
  delete values._id;
  database.collection("adm_usermaster").updateOne(
    { userCode: userCode, userCompanyCode: userCompanyCode },
    {
      $set: {
        ...values,
        updateBy: usr,
        updateOn: new Date(),
      },
    },
    (err, data) => {
      if (err) {
        res.send({ err: err });
        console.log(err, "error");
      } else {
        console.log(values.userCode, "updated");
      }
    }
  );
});
router.put("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const values = req.body.values;
  const userCode = values.userCode;
  database
    .collection("adm_usermaster")
    .deleteOne(
      { userCompanyCode: userCompanyCode, userCode: userCode },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          console.log(userCode + "user deleted");
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

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

const acc = [
  {
    acCode: "G10001",
    acName: "Cash In Hand",
    acGroupCode: "A1018",
    acType: "System",
    preFix: "G",
    userCompanyCode: "all",
    acStatus: "Active",
  },
  {
    acCode: "G10002",
    acName: "Sale A/c",
    acGroupCode: "A1009",
    acType: "System",
    preFix: "G",
    userCompanyCode: "all",
    acStatus: "Active",
  },
  {
    acCode: "G10003",
    acName: "Purchase A/c",
    acGroupCode: "A1013",
    acType: "System",
    preFix: "G",
    userCompanyCode: "all",
    acStatus: "Active",
  },
  {
    acCode: "G10004",
    acName: "Discount A/c",
    acGroupCode: "A1015",
    acType: "System",
    preFix: "G",
    userCompanyCode: "all",
    acStatus: "Active",
  },
  {
    acCode: "G10005",
    acName: "CGST Output",
    acGroupCode: "A1020",
    acType: "System",
    preFix: "G",
    userCompanyCode: "all",
    acStatus: "Active",
  },
  {
    acCode: "G10006",
    acName: "SGST Output",
    acGroupCode: "A1020",
    acType: "System",
    preFix: "G",
    userCompanyCode: "all",
    acStatus: "Active",
  },
  {
    acCode: "G10007",
    acName: "IGST Output",
    acGroupCode: "A1020",
    acType: "System",
    preFix: "G",
    userCompanyCode: "all",
    acStatus: "Active",
  },
  {
    acCode: "G10008",
    acName: "CGST Input",
    acGroupCode: "A1020",
    acType: "System",
    preFix: "G",
    userCompanyCode: "all",
    acStatus: "Active",
  },
  {
    acCode: "G10009",
    acName: "SGST Input",
    acGroupCode: "A1020",
    acType: "System",
    preFix: "G",
    userCompanyCode: "all",
    acStatus: "Active",
  },
  {
    acCode: "G10010",
    acName: "IGST Input",
    acGroupCode: "A1020",
    acType: "System",
    preFix: "G",
    userCompanyCode: "all",
    acStatus: "Active",
  },
  {
    acCode: "G10011",
    acName: "Cess Output",
    acGroupCode: "A1020",
    acType: "System",
    preFix: "G",
    userCompanyCode: "all",
    acStatus: "Active",
  },
  {
    acCode: "G10012",
    acName: "Cess Input",
    acGroupCode: "A1020",
    acType: "System",
    preFix: "G",
    userCompanyCode: "all",
    acStatus: "Active",
  },
  {
    acCode: "G10013",
    acName: "TCS",
    acGroupCode: "A1020",
    acType: "System",
    preFix: "G",
    userCompanyCode: "all",
    acStatus: "Active",
  },
  {
    acCode: "G10014",
    acName: "Round Off",
    acGroupCode: "A1010",
    acType: "System",
    preFix: "G",
    userCompanyCode: "all",
    acStatus: "Active",
  },
];
router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;

  console.log("post request recieved at get accounts");

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
      } else {
        database
          .collection("mst_firmType")
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
          .toArray((err, mst_firmType) => {
            if (err) {
              res.send({ err: err });
            } else {
              database
                .collection("mst_acTypes")
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
                .toArray((err, mst_acTypes) => {
                  if (err) {
                    res.send({ err: err });
                  } else {
                    database
                      .collection("mst_acGroup")
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
                      .toArray((err, mst_acGroup) => {
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
                                database
                                  .collection("mst_acadress")
                                  .find({ userCompanyCode: userCompanyCode })
                                  .toArray((err, acadress) => {
                                    if (err) {
                                      res.send({ err: err });
                                    } else {
                                      res.json({
                                        mst_accounts: mst_accounts,
                                        mst_firmType: mst_firmType,
                                        mst_acTypes: mst_acTypes,
                                        mst_acGroup: mst_acGroup,
                                        mst_mktArea: mst_mktArea,
                                        acadress: acadress,
                                      });
                                    }
                                  });
                              }
                            });
                        }
                      });
                  }
                });
            }
          });
      }
    });
});
router.put("/", verifyToken, (req, res) => {
  console.log("at put of /mst_accounts*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  console.log(userCompanyCode);
  let values = req.body.values;
  if (!values) {
    values = req.body.input;
  }
  delete values.acGroupName;
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
      } else {
        let usrcdarr = [];
        mst_accounts.map((item) => {
          if (item.preFix == values.preFix) {
            console.log(item);
            usrcdarr.push(Number(item.acCode.match(/(\d+)/)[0]));
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
        let max = Number(getMax(usrcdarr));
        Number(getMax(usrcdarr)) === 0
          ? (max = 10000)
          : (max = Number(getMax(usrcdarr)));
        console.log(usrcdarr, max);
        database.collection("mst_accounts").insertOne(
          {
            ...values,
            acCode: values.preFix + JSON.stringify(Number(max) + 1),
            userCompanyCode: userCompanyCode,
            entryBy: userCode,
            entryOn: new Date(),
          },
          (err, data) => {
            if (err) {
              res.send({ err: err });
            } else {
              console.log(Number(max) + 1, Number(max + 1));
              res.send({
                values: {
                  ...values,
                  acCode: values.preFix + JSON.stringify(Number(max) + 1),
                },
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
  const userCode = req.query.userCode;
  console.log(userCode);
  let values = req.body.values;
  if (!values) {
    values = req.body.input;
  }
  delete values.acGroupName;

  const acCode = values.acCode;
  delete values._id;
  database.collection("mst_accounts").updateOne(
    { acCode: acCode, userCompanyCode: userCompanyCode },
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
        res.send({});
      }
    }
  );
});

router.post("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const values = req.body.item;
  database
    .collection("mst_accounts")
    .deleteOne(
      { userCompanyCode: userCompanyCode, acCode: values.acCode },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          res.send({});

          console.log(values.acCode + "deleted");
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

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
    .collection("mst_accounts")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, mst_accounts) => {
      if (err) {
        res.send({ err: err });
      } else {
        database
          .collection("mst_prodMaster")
          .find({})
          .toArray((err, mst_prodMaster) => {
            if (err) {
              res.send({ err: err });
            } else {
              database
                .collection("mst_acadress")
                .find({ userCompanyCode: userCompanyCode })
                .toArray((err, mst_acadress) => {
                  if (err) {
                    res.send({ err: err });
                  } else {
                    database
                      .collection("mst_paymentTerm")
                      .find({ userCompanyCode: userCompanyCode })
                      .toArray((err, mst_paymentTerm) => {
                        if (err) {
                          res.send({ err: err });
                        } else {
                          database
                            .collection("mst_prodMaster")
                            .find({ userCompanyCode: userCompanyCode })
                            .toArray((err, mst_prodMaster) => {
                              if (err) {
                                res.send({ err: err });
                              } else {
                                database
                                  .collection("inv_voucher")
                                  .find({ userCompanyCode: userCompanyCode })
                                  .toArray((err, inv_voucher) => {
                                    if (err) {
                                      res.send({ err: err });
                                    } else {
                                      database
                                        .collection("inv_voucherItems")
                                        .find({
                                          userCompanyCode: userCompanyCode,
                                        })
                                        .toArray((err, inv_voucherItems) => {
                                          if (err) {
                                            res.send({ err: err });
                                          } else {
                                            res.json({
                                              mst_accounts: mst_accounts,
                                              mst_prodMaster: mst_prodMaster,
                                              mst_acadress: mst_acadress,
                                              mst_paymentTerm: mst_paymentTerm,
                                              inv_voucher: inv_voucher,
                                              inv_voucherItems:
                                                inv_voucherItems,
                                              mst_prodMaster: mst_prodMaster,
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
      }
    });
});
router.put("/", verifyToken, (req, res) => {
  console.log("at put of /inv_voucher*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  console.log(userCompanyCode);
  const values = req.body.obj.input;
  const input = req.body.obj.input;
  const items = req.body.obj.itemList;
  values.partyName = "";
  values.billingAdress = "";
  values.shippingAdress = "";
  values.paymentTerms = "";
  values.agentName = "";
  items.prodName = "";
  database
    .collection("inv_voucher")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, inv_voucher) => {
      if (err) {
        res.send({ err: err });
      } else {
        let usrcdarr = [];
        inv_voucher.map((item) => {
          console.log("***", item.vouNo.slice(0, item.vouNo.length - 4));
          if (item.vouNo.slice(0, item.vouNo.length - 4) == values.vouNo) {
            console.log(item);
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
        console.log(usrcdarr, String(getMax(usrcdarr) + 1).length);
        database.collection("inv_voucher").insertOne(
          {
            ...values,
            vouNo: values.vouNo + max,
            vno: max,
            userCompanyCode: userCompanyCode,
            entryBy: userCode,
            entryOn: new Date(),
          },
          (err, data) => {
            if (err) {
              res.send({ err: err });
              console.log(err);
            } else {
              const newItems = items
                .filter((item) => item.vouSrNo !== 0)
                .map((item) => {
                  return {
                    ...item,
                    vouNo: values.vouNo + max,
                    userCompanyCode: userCompanyCode,
                  };
                });
              if (newItems.length !== 0) {
                database
                  .collection("inv_voucherItems")
                  .insertMany(newItems, (err, data) => {
                    if (err) {
                      res.send({ err: err });
                      console.log(err);
                    } else {
                    }
                  });
              }
              res.send({
                values: {
                  ...input,
                  vouNo: values.vouNo + max,
                  vno: max,
                },
                items: newItems,
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
  let values = req.body.input;
  delete values._id;
  values.partyName = "";
  values.billingAdress = "";
  values.shippingAdress = "";
  values.paymentTerms = "";
  values.agentName = "";
  // values.prodName = "";

  database.collection("inv_voucher").updateOne(
    { vouNo: values.vouNo, userCompanyCode: userCompanyCode },
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
        res.send({
          values: {
            ...req.body.input,
          },
        });
      }
    }
  );
});

router.post("/", verifyToken, (req, res) => {
  console.log("at post of /inv_voucher*******");

  const userCompanyCode = req.query.userCompanyCode;
  const values = req.body.item;
  console.log(values.vouNo);
  database
    .collection("inv_voucher")
    .deleteOne(
      { userCompanyCode: userCompanyCode, vouNo: values.vouNo },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          res.send({});

          console.log(values.vouNo + "deleted", data);
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
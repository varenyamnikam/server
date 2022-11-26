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
  const date = req.query.date;
  const docCode = req.query.docCode;
  console.log("get request recieved at get dc(stockonly)", date);
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
                                  .find({
                                    userCompanyCode: userCompanyCode,
                                    docCode: docCode,
                                  })
                                  .toArray((err, inv_voucher) => {
                                    if (err) {
                                      res.send({ err: err });
                                    } else {
                                      const voucher = inv_voucher.filter(
                                        (item) =>
                                          new Date(item.vouDate).getTime() >=
                                          new Date(date).getTime()
                                      );
                                      // console.log(
                                      //   voucher.length,
                                      //   new Date(
                                      //     inv_voucher[
                                      //       inv_voucher.length - 1
                                      //     ].vouDate
                                      //   ).getTime() >= new Date(date).getTime(),
                                      //   voucher[voucher.length - 1].vouDate
                                      // );
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
                                              inv_voucher: voucher,
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
  const useBatch = req.query.useBatch;

  const values = req.body.obj.input;
  const date = req.body.obj.date;
  console.log(userCompanyCode, typeof values.vouDate, new Date(date));
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
                .filter((item) => Number(item.vouSrNo) !== 0)
                .map((item) => {
                  return {
                    ...item,
                    prodName: "",
                    vouNo: values.vouNo + max,
                    userCompanyCode: userCompanyCode,
                    docCode: values.docCode,
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
                      if (
                        values.docCode == "DC" ||
                        values.docCode == "GR" ||
                        values.docCode == "SI"
                      ) {
                        const stockItems = newItems.map((item) => {
                          if (item.docCode == "DC" || values.docCode == "SI") {
                            if (useBatch == "Yes") {
                              console.log(item.batchList);
                              return item.batchList.map((b) => {
                                return {
                                  userCompanyCode: userCompanyCode,
                                  prodCode: item.prodCode,
                                  batchNo: b.batchNo,
                                  inwardQty: "",
                                  outwardQty: b.sell,
                                  rate: item.rate,
                                  refType: values.docCode,
                                  refNo: values.vouNo + max,
                                  expDate: item.expDate,
                                };
                              });
                            } else {
                              return {
                                userCompanyCode: userCompanyCode,
                                prodCode: item.prodCode,
                                batchNo: item.batchNo,
                                inwardQty: "",
                                outwardQty: item.qty,
                                rate: item.rate,
                                refType: values.docCode,
                                refNo: values.vouNo + max,
                                expDate: item.expDate,
                              };
                            }
                          } else if (item.docCode == "GR") {
                            return {
                              userCompanyCode: userCompanyCode,
                              prodCode: item.prodCode,
                              batchNo: item.batchNo,
                              inwardQty: item.qty,
                              outwardQty: "",
                              rate: item.rate,
                              refType: values.docCode,
                              refNo: values.vouNo + max,
                              expDate: item.expDate,
                            };
                          }
                        });
                        console.log("hi**", stockItems);
                        database
                          .collection("inv_stockLedger")
                          .insertMany(stockItems.flat(), (err, data) => {
                            if (err) {
                              res.send({ err: err });
                              console.log("error!", err);
                            } else {
                              res.send({
                                values: {
                                  ...input,
                                  vouNo: values.vouNo + max,
                                  vno: max,
                                },
                                items: newItems,
                              });
                            }
                          });
                      }
                    }
                  });
              }
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
  const useBatch = req.query.useBatch;

  console.log(userCode);
  let values = req.body.obj.input;
  let itemList = req.body.obj.itemList;
  console.log(itemList);
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
            ...req.body.obj.input,
          },
        });
      }
    }
  );
  const newItems = itemList
    .filter((item) => Number(item.vouSrNo) !== 0)
    .map((item) => {
      return {
        ...item,
        prodName: "",
        vouNo: values.vouNo,
        userCompanyCode: userCompanyCode,
        docCode: values.docCode,
      };
    });
  database.collection("inv_voucherItems").deleteMany(
    {
      vouNo: values.vouNo,

      userCompanyCode: userCompanyCode,
    },

    (err, data) => {
      if (err) {
        res.send({ err: err });
        console.log(err, "error");
      } else {
      }
    }
  );

  newItems.map((item) => {
    delete item._id;
    database.collection("inv_voucherItems").insertOne(
      {
        vouNo: values.vouNo,
        vouSrNo: item.vouSrNo,
        userCompanyCode: userCompanyCode,
      },
      {
        $set: {
          ...item,
          updateBy: userCode,
          updateOn: new Date(),
        },
      },
      { upsert: true },
      (err, data) => {
        if (err) {
          res.send({ err: err });
          console.log(err, "error");
        } else {
        }
      }
    );
  });
  if (
    values.docCode == "DC" ||
    values.docCode == "GR" ||
    values.docCode == "SI"
  ) {
    const stockItems = newItems.map((item) => {
      if (item.docCode == "DC" || values.docCode == "SI") {
        if (useBatch == "Yes") {
          console.log(item.batchList);
          return item.batchList.map((b) => {
            return {
              userCompanyCode: userCompanyCode,
              prodCode: item.prodCode,
              batchNo: b.batchNo,
              inwardQty: "",
              outwardQty: b.sell,
              rate: item.rate,
              refType: values.docCode,
              refNo: values.vouNo,
            };
          });
        } else {
          return {
            userCompanyCode: userCompanyCode,
            prodCode: item.prodCode,
            batchNo: item.batchNo,
            inwardQty: "",
            outwardQty: item.qty,
            rate: item.rate,
            refType: values.docCode,
            refNo: values.vouNo,
          };
        }
      } else if (item.docCode == "GR") {
        return {
          userCompanyCode: userCompanyCode,
          prodCode: item.prodCode,
          batchNo: item.batchNo,
          inwardQty: item.qty,
          outwardQty: "",
          rate: item.rate,
          refType: values.docCode,
          refNo: values.vouNo,
        };
      }
    });
    console.log("hi**", stockItems);
    database
      .collection("inv_stockLedger")
      .deleteMany(
        { userCompanyCode: userCompanyCode, refNo: values.vouNo },
        (err, data) => {
          if (err) {
            res.send({ err: err });
            console.log("error!", err);
          } else {
            console.log("line401", data);
            database
              .collection("inv_stockLedger")
              .insertMany(stockItems.flat(), (err, data) => {
                if (err) {
                  res.send({ err: err });
                  console.log("error!", err);
                } else {
                  console.log(data);
                }
              });
          }
        }
      );
  }
});

router.delete("/", verifyToken, (req, res) => {
  console.log("at delete of /inv_voucher*******");

  const userCompanyCode = req.query.userCompanyCode;
  const values = req.body;
  console.log(values.vouNo);
  database
    .collection("inv_voucher")
    .deleteOne(
      { userCompanyCode: userCompanyCode, vouNo: values.vouNo },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          database
            .collection("inv_stockLedger")
            .deleteMany(
              { userCompanyCode: userCompanyCode, refNo: values.vouNo },
              (err, data) => {
                if (err) {
                  res.send({ err: err });
                } else {
                  database
                    .collection("inv_voucherItems")
                    .deleteMany(
                      { userCompanyCode: userCompanyCode, vouNo: values.vouNo },
                      (err, data) => {
                        if (err) {
                          res.send({ err: err });
                        } else {
                        }
                      }
                    );
                }
              }
            );

          console.log(values.vouNo + "deleted", data);
        }
      }
    );
});
router.post("/", verifyToken, (req, res) => {
  console.log("at post of /inv_voucher*******");

  const userCompanyCode = req.query.userCompanyCode;
  const code = req.body.code;
  database
    .collection("inv_voucher")
    .findOne({ userCompanyCode: userCompanyCode, vouNo: code }, (err, data) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.send({ values: data });
      }
    });
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

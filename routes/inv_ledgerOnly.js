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
const ledgerArr = [
  { code: "partyCode", feild: "netAmount", type: "debit" },
  { code: "G1002", feild: "qrTotal", type: "credit" },
  { code: "G1004", feild: "discountTotal", type: "debit" },
  { code: "G1005", feild: "cgstTotal", type: "credit" },
  { code: "G1006", feild: "sgstTotal", type: "credit" },
  { code: "G1007", feild: "igstTotal", type: "credit" },
  { code: "G1010", feild: "cessTotal", type: "credit" },
  { code: "G1011", feild: "billDis", type: "debit" },
  { code: "G1009", feild: "roundOff", type: "both" },
];
const fullForms = [
  { short: "QT", full: "Quotation" },
  { short: "SO", full: "Sale Order" },
  { short: "PI", full: "Profarma Invoice" },
  { short: "DC", full: "Delivery Challan" },
  { short: "SI", full: "Sale Invoice" },
  { short: "SR", full: "Sale Return" },
  { short: "PO", full: "Purchase Order" },
  { short: "GR", full: "Good Receipt Note" },
  { short: "PV", full: "Purchase Voucher" },
  { short: "PR", full: "Purchase Return" },
  { short: "CN", full: "Credit Note" },
  { short: "DN", full: "Debit Note" },
];
function getFullForm(voucher) {
  const full = fullForms.find((item) => item.short == voucher.docCode);
  return full.full + "No" + `${voucher.vouNo}`;
}
router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const date = req.query.date;
  const docCode = req.query.docCode;

  console.log("post request recieved at get ledger", date);
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
  console.log("at put of /inv_ledger*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
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
                      const initialLedger = {
                        userCompanyCode: userCompanyCode,
                        vouNo: values.vouNo,
                        branchCode: values.branchCode,
                        docCode: values.docCode,
                        finYear: values.finYear,
                        vno: values.vno,
                        manualNo: values.manualNo,
                        vouDate: values.vouDate,
                        srNo: "",
                        acCode: "",
                        debit: "",
                        credit: "",
                        narration: "",
                        refType: values.refType,
                        refNo: values.refNo,
                        vouStatus: "Clear",
                        checkNo: "",
                        favouringName: "",
                        entryBy: userCode,
                        entryOn: new Date(),
                      };
                      let cgstTotal = 0;
                      let sgstTotal = 0;
                      let igstTotal = 0;
                      let cessTotal = 0;
                      let qrTotal = 0;
                      let discountTotal = 0;
                      newItems.map((newItem) => {
                        cgstTotal += Number(newItem.cgst);
                        sgstTotal += Number(newItem.sgst);
                        igstTotal += Number(newItem.igst);
                        cessTotal += Number(newItem.cess);
                        qrTotal += Number(newItem.qr);
                        discountTotal += Number(newItem.discount);
                      });
                      const newVoucher = {
                        ...values,
                        cgstTotal: cgstTotal,
                        sgstTotal: sgstTotal,
                        igstTotal: igstTotal,
                        cessTotal: cessTotal,
                        qrTotal: qrTotal,
                        discountTotal: discountTotal,
                        billDis: Number(values.billDis),
                        roundOff: Number(values.roundOff),
                      };
                      let finalArr;
                      if (
                        values.docCode == "SI" ||
                        values.docCode == "PR" ||
                        values.docCode == "DN"
                      ) {
                        finalArr = ledgerArr
                          .filter((item) => newVoucher[item.feild] !== 0)
                          .map((item) => {
                            if (item.type == "credit") {
                              return {
                                ...initialLedger,
                                acCode: item.code,
                                credit: newVoucher[item.feild],
                                narration: getFullForm(values),
                              };
                            } else if (item.type == "debit") {
                              return {
                                ...initialLedger,
                                acCode: item.code,
                                debit: newVoucher[item.feild],
                                narration: getFullForm(values),
                              };
                            } else {
                              if (newVoucher[item.feild] >= 0)
                                return {
                                  ...initialLedger,
                                  acCode: item.code,
                                  credit: newVoucher[item.feild],
                                  narration: getFullForm(values),
                                };
                              else
                                return {
                                  ...initialLedger,
                                  acCode: item.code,
                                  debit: newVoucher[item.feild],
                                  narration: getFullForm(values),
                                };
                            }
                          });
                      } else {
                        finalArr = ledgerArr
                          .filter((item) => newVoucher[item.feild] !== 0)
                          .map((item) => {
                            if (item.type == "credit") {
                              return {
                                ...initialLedger,
                                acCode: item.code,
                                debit: newVoucher[item.feild],
                                narration: getFullForm(values),
                              };
                            } else if (item.type == "debit") {
                              return {
                                ...initialLedger,
                                acCode: item.code,
                                credit: newVoucher[item.feild],
                                narration: getFullForm(values),
                              };
                            } else {
                              if (newVoucher[item.feild] >= 0)
                                return {
                                  ...initialLedger,
                                  acCode: item.code,
                                  debit: newVoucher[item.feild],
                                  narration: getFullForm(values),
                                };
                              else
                                return {
                                  ...initialLedger,
                                  acCode: item.code,
                                  credit: newVoucher[item.feild],
                                  narration: getFullForm(values),
                                };
                            }
                          });
                      }
                      database
                        .collection("inv_acLedger")
                        .insertMany(finalArr, (err, data) => {
                          if (err) {
                            res.send({ err: err });
                          } else
                            res.send({
                              values: {
                                ...input,
                                vouNo: values.vouNo + max,
                                vno: max,
                              },
                              items: newItems,
                            });
                        });
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
          res.send({});

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

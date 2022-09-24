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
const branchValues = {
  contactNo: "",
  Mobileno: "",
  // pesticideLicenceNo: "",
  // seedLicenceNo: "",
  acBranchCode: "1001",
  Emailid: "",
  GSTno: "",
  pinCode: "",
  adressLine2: "",
  adressLine1: "",
  branchCode: "1001",
  branchName: "Main Branch",
  branchType: "",
  stateCode: "",
  stateName: "",
  countryName: "",
  districtName: "",
  talukaName: "",
};
const start =
  String(Array.from(String(new Date().getFullYear()), Number)[2]) +
  String(Array.from(String(new Date().getFullYear()), Number)[3]);
const end =
  String(Array.from(String(new Date().getFullYear() + 1), Number)[2]) +
  String(Array.from(String(new Date().getFullYear() + 1), Number)[3]);

const initialFinValues = {
  yearCode: start + end,
  finYear: "20" + start + "-" + end,
  yearStartDate: new Date(new Date().getFullYear() + 1, 3, 1),
  yearEndDate: new Date(new Date().getFullYear(), 2, 31),
  isDefaultYear: "Y",
  isClosed: "N",
};

const userValues = {
  AllowBranchChange: "",
  AllowYearChange: "",
  defaultBranchCode: "1001",
  defaultYearCode: initialFinValues.yearCode,
  Emailid: "",
  Mobileno: "",
  Password: "",
  RePassword: "",
  Role: "",
  Status: "Active",
  userName: "",
  userCode: "1001",
};

function generatePassword() {
  var length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

router.post("/", verifyToken, (req, res) => {
  console.log("at Register*******");
  const values = req.body.values;
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  database
    .collection("adm_company")
    .find({})
    .toArray((err, adm_company) => {
      if (err) {
        res.send({ err: err });
      } else {
        let usrcdarr = [];
        adm_company.map((item) => {
          usrcdarr.push(item.companyCode);
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
        database.collection("adm_company").insertOne(
          {
            ...values,
            companyCode: JSON.stringify(parseInt(max) + 1),
            clientCode: values.regMobileNo,
            regDate: new Date(),
            validUpto: date,
          },
          (err, data) => {
            if (err) {
              res.send({ err: err });
            } else {
              const pswrd = generatePassword();
              database.collection("adm_usermaster").insertOne(
                {
                  ...userValues,
                  userName: values.ownerName,
                  Password: pswrd,
                  RePassword: pswrd,
                  userCompanyCode: JSON.stringify(parseInt(max) + 1),
                  Mobileno: values.regMobileNo,
                },
                (err, data) => {
                  if (err) {
                    res.send({ err: err });
                  } else {
                    database.collection("adm_branch").insertOne(
                      {
                        ...branchValues,
                        pinCode: values.pincode,
                        adressLine2: values.adressLine2,
                        adressLine1: values.adressLine1,
                        stateCode: values.stateCode,
                        countryCode: values.countryCode,
                        districtName: values.districtName,
                        talukaName: values.talukaName,
                        userCompanyCode: JSON.stringify(parseInt(max) + 1),
                      },
                      (err, data) => {
                        if (err) {
                          res.send({ err: err });
                        } else {
                          database.collection("adm_finYear").insertOne(
                            {
                              ...initialFinValues,
                              userCompanyCode: JSON.stringify(
                                parseInt(max) + 1
                              ),
                            },
                            (err, data) => {
                              if (err) {
                                res.send({ err: err });
                              } else {
                                console.log(
                                  parseInt(max) + 1,
                                  parseInt(max + 1)
                                );
                                res.send({
                                  companyCode: parseInt(max) + 1,
                                  userCode: 1001,
                                  password: pswrd,
                                });
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
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
const express = require("express");
const router = express.Router();
var mongoUtil = require("../mongoUtil");
const cloudDb = mongoUtil.connectToServer();
const databaseName = mongoUtil.getDb();
console.log(databaseName, cloudDb);
const MongoClient = require("mongodb").MongoClient;
const accountSid = "AC7370650b1560b1f326015799878dca47";
const authToken = "0158f8dd4254ad8eb8fb1eaf40223a26";
const client = require("twilio")(accountSid, authToken);
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
  branchType: "BRANCH",
  stateCode: "",
  stateName: "",
  countryName: "",
  districtName: "",
  talukaName: "",
};
let startYear = Array.from(String(new Date().getFullYear()), Number);
let endYear = Array.from(String(new Date().getFullYear() + 1), Number);
let startDate = new Date(new Date().getFullYear(), 3, 1);
let endDate = new Date(new Date().getFullYear() + 1, 2, 31);

if (
  new Date(new Date().getFullYear(), 3, 1).setUTCHours(0, 0, 0, 0) >
  new Date().setUTCHours(0, 0, 0, 0)
) {
  startYear = Array.from(String(new Date().getFullYear() - 1), Number);
  endYear = Array.from(String(new Date().getFullYear()), Number);
  startDate = new Date(new Date().getFullYear() - 1, 3, 1);
  endDate = new Date(new Date().getFullYear(), 2, 31);
}
let start = String(startYear[2]) + String(startYear[3]);
let end = String(endYear[2]) + String(endYear[3]);

const initialFinValues = {
  yearCode: start + end,
  finYear: "20" + start + "-" + end,
  yearStartDate: startDate,
  yearEndDate: endDate,
  isDefaultYear: "Y",
  isClosed: "N",
};

const userValues = {
  AllowBranchChange: "",
  AllowYearChange: "",
  defaultBranchCode: "1001",
  defaultYearCode: initialFinValues.yearCode,
  defaultBranchName: "",
  defaultFinYear: initialFinValues.finYear,
  Emailid: "",
  Mobileno: "",
  Password: "",
  RePassword: "",
  Role: "",
  Status: "Active",
  userName: "",
  userCode: "1001",
};
const initialAcType = {
  acType: "",
  acTypeStatus: "Active",
  acTypeFor: "General",
  userCompanyCode: "",
  entryBy: "1001",
  entryOn: new Date(),
};
const defaultAcTypes = [
  "Retailer",
  "Wholesaler",
  "Permanant",
  "System",
  "General",
];
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
  const input = req.body.input;

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
                  Emailid: values.email,
                },
                (err, data) => {
                  if (err) {
                    res.send({ err: err });
                  } else {
                    database.collection("adm_branch").insertOne(
                      {
                        ...branchValues,
                        GSTno: values.gstInNo,
                        pinCode: values.pinCode,
                        adressLine2: values.adressLine2,
                        adressLine1: values.adressLine1,
                        stateCode: values.stateCode,
                        countryCode: values.countryCode,
                        districtName: values.districtName,
                        talukaName: values.talukaName,
                        Emailid: values.email,
                        contactNo: values.contactNo,
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
                                database
                                  .collection("adm_softwareSettings")
                                  .insertOne(
                                    {
                                      ...input,
                                      userCompanyCode: JSON.stringify(
                                        parseInt(max) + 1
                                      ),
                                      entryBy: "1001",
                                      entryOn: new Date(),
                                    },
                                    (err, data) => {
                                      if (err) {
                                        res.send({ err: err });
                                      } else {
                                        res.send({
                                          companyCode: parseInt(max) + 1,
                                          userCode: 1001,
                                          password: pswrd,
                                        });
                                        const x = parseInt(max) + 1;
                                        client.messages
                                          .create({
                                            body: `
                                            companyCode: ${x},
                                            userCode:${1001},
                                            password:${pswrd}
                                            `,
                                            to: `+91${values.regMobileNo}`, // Text this number
                                            from: "+12054988742", // From a valid Twilio number
                                          })
                                          .then((message) => {
                                            console.log(message.sid);
                                            console.log(
                                              `message sent to +91${values.regMobileNo}`
                                            );
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
          }
        );
      }
    });
});
router.patch("/", verifyToken, (req, res) => {
  console.log("at patch delete of /register*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const values = req.body.values;
  console.log(values);
  delete values._id;
  database.collection("adm_company").updateOne(
    {
      companyCode: userCompanyCode,
    },
    { $set: { ...values } },
    (err, data) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.send({
          msg: "entry deleted successfully",
        });
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

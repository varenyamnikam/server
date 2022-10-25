const express = require("express");
const router = express.Router();
var mongoUtil = require("../mongoUtil");
const jwt = require("jsonwebtoken");
const MongoClient = require("mongodb").MongoClient;
const cloudDb = mongoUtil.connectToServer();
const databaseName = mongoUtil.getDb();
console.log(databaseName, cloudDb);
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
router.post("/", (req, res) => {
  const userCode = req.body.usrCode;
  const userPassword = req.body.usrPassword;
  const userCompanyCode = req.body.usrCompanyCode;
  console.log(
    "at login ****************",
    userCode,
    userCompanyCode,
    userPassword
  );
  // .collection("adm_usermaster")
  // .find({})
  // .toArray((err, users) => {
  //   console.log(users);
  // });

  database.collection("adm_usermaster").findOne(
    {
      userCode: userCode,
      Password: userPassword,
      userCompanyCode: userCompanyCode,
    },
    function (err, user) {
      if (err) {
        res.send({ err: err });
      }

      if (user === null) {
        res.json({
          auth: false,
          message: "wrong usrCode/usrPassword combination",
        });
        console.log("NULL USER");
      } else {
        var userCode = user.userCode;
        var userName = user.userName;
        var userCompanyCode = user.userCompanyCode;
        if (userName.length > 0) {
          const token = jwt.sign({ userCode }, "jwtSecret", {
            expiresIn: 3000,
          });

          database
            .collection("adm_screen")
            .find({})
            .toArray((err, result) => {
              if (err) {
                res.send({ err: err });
              } else {
                database
                  .collection("adm_company")
                  .find({ companyCode: userCompanyCode })
                  .toArray((err, cmpny) => {
                    if (err) {
                      res.send({ err: err });
                    } else {
                      database
                        .collection("adm_branch")
                        .find({
                          userCompanyCode: userCompanyCode,
                          branchCode: user.defaultBranchCode,
                        })
                        .toArray((err, dBranch) => {
                          if (err) {
                            res.send({ err: err });
                          } else {
                            database
                              .collection("adm_userrights")
                              .find({
                                userCompanyCode: userCompanyCode,
                              })
                              .toArray((err, adm_userrights) => {
                                if (err) {
                                  res.send({ err: err });
                                } else {
                                  database
                                    .collection("adm_softwareSettings")
                                    .findOne(
                                      {
                                        userCompanyCode: userCompanyCode,
                                      },
                                      function (err, adm_softwareSettings) {
                                        if (err) {
                                          res.send({ err: err });
                                        } else {
                                          database
                                            .collection("adm_company")
                                            .findOne(
                                              {
                                                companyCode: userCompanyCode,
                                              },
                                              function (err, company) {
                                                if (err) {
                                                  res.send({ err: err });
                                                } else {
                                                  user.defaultBranchName =
                                                    dBranch[0].branchName;
                                                  console.log(
                                                    adm_softwareSettings
                                                  );
                                                  console.log(company);
                                                  res.send({
                                                    auth: true,
                                                    token: token,
                                                    result: result,
                                                    userName: userName,
                                                    userCompanyCode:
                                                      userCompanyCode,
                                                    adm_userrights:
                                                      adm_userrights,
                                                    userCompanyName:
                                                      cmpny[0].companyName,
                                                    userCode: userCode,
                                                    user: user,
                                                    Status: user.Status,
                                                    adm_softwareSettings:
                                                      adm_softwareSettings,
                                                    company: company,
                                                  });
                                                }
                                              }
                                            );
                                        }
                                      }
                                    );
                                }
                              });
                          }
                        });
                    }
                  });
              }
            });
        } else {
          res.json({
            auth: false,
            message: "wrong usrCode/usrPassword combination",
          });
          console.log("wrong usrCode/usrPassword combination");
        }
      }
    }
  );
});

module.exports = router;

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403); //forbidden
  }
}

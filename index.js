const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = express();
const dotenv = require("dotenv");
const path = require("path");
// var database;
let result1 = [];
const router = express.Router();
var mongoUtil = require("./mongoUtil");
// dotenv.config({ path: "./config.env" });
const PORT = process.env.PORT || 3001;
app.use(express.json());
app.use(
  cors({
    origin: [PORT],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

if ((process.env.NODE_ENV = "production")) {
  app.use(express.static("static"));
}
// app.get("*", function (req, res) {
//   res.sendFile(path.join(__dirname, "../public", "index.html"));
//   console.log("at 404 ****************");
// });

// if ((process.env.NODE_ENV = "production")) {
//   app.use(express.static("client/build"));
//   const path = require("path");
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(_dirname, "client", "build", "index.html"));
//   });
// }
const userMasterRoute = require("./routes/userMaster");
const login = require("./routes/login");
const adm_finYear = require("./routes/adm_finYear");
const adm_userrole = require("./routes/adm_userrole");
const adm_userrights = require("./routes/adm_userrights");
const adm_branch = require("./routes/adm_branch");
const mst_unit = require("./routes/mst_unit");
const mst_prodCompany = require("./routes/mst_prodCompany");
const mst_prodTypes = require("./routes/mst_prodTypes");
const mst_prodMaster = require("./routes/mst_prodMaster");
const mst_accounts = require("./routes/mst_accounts");
const mst_acglgroup = require("./routes/mst_acglgroup");
const mst_acgl = require("./routes/mst_acgl");
const mst_acadress = require("./routes/mst_acadress");
const mst_paymentTerms = require("./routes/mst_paymentTerms");
const mst_mktArea = require("./routes/mst_mktArea");
const register = require("./routes/Register");
const inv_stockOnly = require("./routes/inv_stockOnly");
const inv_ledgerOnly = require("./routes/inv_ledgerOnly");
const inv_both = require("./routes/inv_both");

const soft = require("./routes/soft");

app.use("/register", register);
app.use("/login", login);
app.use("/adm_finYear", adm_finYear);
app.use("/adm_userrole", adm_userrole);
app.use("/adm_userrights", adm_userrights);
app.use("/adm_branch", adm_branch);
app.use("/adm_usermaster", userMasterRoute);
app.use("/mst_unit", mst_unit);
app.use("/mst_prodCompany", mst_prodCompany);
app.use("/mst_prodTypes", mst_prodTypes);
app.use("/mst_prodMaster", mst_prodMaster);
app.use("/mst_accounts", mst_accounts);
app.use("/mst_acglgroup", mst_acglgroup);
app.use("/mst_acgl", mst_acgl);
app.use("/mst_acadress", mst_acadress);
app.use("/mst_paymentTerms", mst_paymentTerms);
app.use("/mst_mktArea", mst_mktArea);
app.use("/inv_dc", inv_stockOnly);
app.use("/inv_ledger", inv_ledgerOnly);
app.use("/inv_both", inv_both);
app.use("/soft", soft);

// app.post("/adm_userrole", verifyToken, (req, res) => {
//   database
//     .collection("adm_userrole")
//     .find({})
//     .toArray((err, adm_userrole) => {
//       if (err) {
//         res.send({ err: err });
//       } else {
//         database
//           .collection("adm_userrights")
//           .find({})
//           .toArray((err, adm_userrights) => {
//             if (err) {
//               res.send({ err: err });
//             } else {
//               res.json({
//                 adm_userrole: adm_userrole,
//                 adm_userrights: adm_userrights,
//               });
//               // console.log(adm_userrole, adm_userrights);
//             }
//           });
//       }
//     });
// });

// app.post("/post_userrole", verifyToken, (req, res) => {
//   const roleCode = req.body.roleCode;
//   const roleName = req.body.roleName;

//   database
//     .collection("adm_userrole")
//     .createIndex({ roleCode: 2 }, { unique: true });

//   database.collection("adm_userrole").insertOne(
//     {
//       roleCode: roleCode,
//       roleName: roleName,
//     },
//     (err, data) => {
//       if (err) {
//         // res.send({ err: err })
//         res.json({ auth: true, message1: "Role Code already exist" });
//       } else {
//         // console.log(data.roleCode);
//         res.json({ auth: true, message1: "Inserted" });
//       }
//     }
//   );
// });

// app.post("/adm_userrights", verifyToken, (req, res) => {
//   console.log("yes u r right");
//   const roleCode = req.body.roleCode;
//   const roleName = req.body.roleName;
//   const menuRight = req.body.menuRight;
//   const addRight = req.body.addRight;
//   const editRight = req.body.editRight;
//   const deleteRight = req.body.deleteRight;
//   console.log("requwst recieved");
//   database.collection("adm_userrights").insertOne(
//     {
//       roleCode: roleCode,
//       roleName: roleName,
//       menuRight: menuRight,
//       addRight: addRight,
//       editRight: editRight,
//       deleteRight: deleteRight,
//     },
//     (err, data) => {
//       if (err) {
//         res.send({ err: err });
//       } else {
//         res.json({ auth: true, message1: "Inserted" });
//       }
//     }
//   );
// });

// app.post("/delete_adm_userrights", verifyToken, (req, res) => {
//   const roleCode = req.body.roleCode;
//   const roleName = req.body.roleName;
//   // console.log(roleCode, ",", roleName);
//   // const id = req.body._id;
//   // console.log(ObjectId(id));
//   database
//     .collection("adm_userrights")
//     .deleteOne({ roleCode: roleCode, roleName: roleName }, (err, data) => {
//       if (err) {
//         res.send({ err: err });
//       } else {
//         console.log("wuahahaha");
//       }
//     });
// });

// app.post("/delete_adm_userrole", verifyToken, (req, res) => {
//   const roleCode = req.body.roleCode;
//   // console.log(roleCode);
//   database
//     .collection("adm_userrights")
//     .deleteOne({ roleCode: roleCode }, (err, data) => {
//       if (err) {
//         res.send({ err: err });
//       }
//     });

//   database
//     .collection("adm_userrole")
//     .deleteOne({ roleCode: roleCode }, (err, data) => {
//       if (err) {
//         res.send({ err: err });
//       }
//     });

//   database
//     .collection("adm_userrole")
//     .find({})
//     .toArray((err, adm_userrole1) => {
//       if (err) {
//         res.send({ err: err });
//       } else {
//         // console.log(adm_userrole1);
//         res.json({ auth: true, adm_userrole1: adm_userrole1 });
//       }
//     });
// });
// app.post("/post_userrights", verifyToken, (req, res) => {
//   console.log("post request recieved");
//   database
//     .collection("adm_userrights")
//     .find({})
//     .toArray((err, adm_userrights) => {
//       if (err) {
//         res.send({ err: err });
//       } else {
//         res.json({ adm_userrights: adm_userrights });
//       }
//     });
// });

// app.post("/delete_adm_usermaster", verifyToken, (req, res) => {
//   const roleCode = req.body.roleCode;
//   const roleName = req.body.roleName;
//   // console.log(roleCode, ",", roleName);
//   // const id = req.body._id;
//   // console.log(ObjectId(id));
//   database
//     .collection("adm_adm_usermaster")
//     .deleteOne({ roleCode: roleCode, roleName: roleName }, (err, data) => {
//       if (err) {
//         res.send({ err: err });
//       } else {
//         // console.log("wuahahaha");
//       }
//     });
// });
// app.post("/post_adduser", verifyToken, (req, res) => {
//   const values = req.body.values;
//   database
//     .collection("adm_usermaster")
//     .find({})
//     .toArray((err, adm_usermaster) => {
//       if (err) {
//         res.send({ err: err });
//       } else {
//         let usrcdarr = [];
//         adm_usermaster.map((item) => {
//           usrcdarr.push(item.userCode);
//         });
//         function getMax(usrcdarr) {
//           let x = 0;
//           usrcdarr.map((item) => {
//             if (item > x) {
//               x = item;
//             }
//           });
//           console.log(x);
//           return x;
//         }
//         const max = parseInt(getMax(usrcdarr));
//         console.log(usrcdarr, max);
//         database
//           .collection("adm_usermaster")
//           .insertOne(
//             { ...values, userCode: parseInt(max) + 1 },
//             (err, data) => {
//               if (err) {
//                 res.send({ err: err });
//               } else {
//                 console.log(parseInt(max) + 1, parseInt(max + 1));
//                 res.send({
//                   values: { ...values, userCode: parseInt(max) + 1 },
//                   userCode: max + 1,
//                 });
//               }
//             }
//           );
//       }
//     });
// });
// app.post("/post_updateuser", verifyToken, (req, res) => {
//   const values = req.body.values;
//   const userCode = values.userCode;
//   // console.log(roleCode, ",", roleName);
//   // const id = req.body._id;
//   console.log("hi");
//   delete values["_id"];
//   database
//     .collection("adm_usermaster")
//     .updateOne({ userCode: userCode }, { $set: { ...values } }, (err, data) => {
//       if (err) {
//         res.send({ err: err });
//         console.log("user errorred", err, values);
//       } else {
//         console.log(userCode + "user updated");
//       }
//     });
// });
// app.post("/post_deleteuser", verifyToken, (req, res) => {
//   const values = req.body.values;
//   const userCode = values.userCode;
//   database
//     .collection("adm_usermaster")
//     .deleteOne({ userCode: userCode }, (err, data) => {
//       if (err) {
//         res.send({ err: err });
//       } else {
//         console.log(userCode + "user deleted");
//       }
//     });
// });
app.post("/post_location", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  console.log("/post_location");
  database
    .collection("mst_state")
    .find({})
    .toArray((err, states) => {
      if (err) {
        console.log("err in location");
      } else {
        // res.send({ countries: countries });
        database
          .collection("mst_district")
          .find({})
          .toArray((err, districts) => {
            if (err) {
              console.log("err in loc");
            } else {
              database
                .collection("mst_country")
                .find({})
                .toArray((err, country) => {
                  if (err) {
                    console.log("err in loc");
                  } else {
                    database
                      .collection("mst_taluka")
                      .find({})
                      .toArray((err, talukas) => {
                        if (err) {
                          console.log("err in loc");
                        } else {
                          res.send({
                            states: states,
                            districts: districts,
                            talukas: talukas,
                            country: country,
                          });
                          console.log(
                            "get location",
                            states.length,
                            districts.length,
                            talukas.length,
                            country.length
                          );
                        }
                      });
                  }
                });
            }
          });
      }
    });
});
app.post("/post_addbranch", verifyToken, (req, res) => {
  const values = req.body.values;
  database
    .collection("adm_branch")
    .find({})
    .toArray((err, adm_branch) => {
      if (err) {
        res.send({ err: err });
      } else {
        let usrcdarr = [];
        adm_branch.map((item) => {
          usrcdarr.push(item.branchCode);
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
        const max = getMax(usrcdarr);
        console.log(usrcdarr, max);
        database.collection("adm_branch").insertOne(
          {
            ...values,
            branchCode: parseInt(max) + 1,
            branchValue: values.branchName.replace(/\s/g, ""),
          },
          (err, data) => {
            if (err) {
              res.send({ err: err });
            } else {
              console.log(values.branchName.replace(/\s/g, ""));
              res.send({
                values: { ...values, branchCode: parseInt(max) + 1 },
                branchCode: parseInt(max) + 1,
              });
            }
          }
        );
      }
    });
});
app.post("/post_deletebranch", verifyToken, (req, res) => {
  const values = req.body.values;
  const branchCode = values.branchCode;
  database
    .collection("adm_branch")
    .deleteOne({ branchCode: branchCode }, (err, data) => {
      if (err) {
        res.send({ err: err });
      } else {
        console.log(branchCode + "branch deleted");
      }
    });
});
app.post("/post_updatebranch", verifyToken, (req, res) => {
  const values = req.body.values;
  const branchCode = values.branchCode;
  console.log(values);
  // const id = req.body._id;
  database.collection("adm_usermaster").updateOne(
    { branchCode: branchCode },
    {
      $set: { ...values },
    },
    (err, data) => {
      if (err) {
        res.send({ err: err });
      } else {
        console.log(branchCode + "user updated");
      }
    }
  );
});
app.post("/post_addlocation", verifyToken, (req, res) => {
  console.log("/post_addlocation ");

  const values = req.body.values;
  if (!values.stateName) {
    database.collection("mst_country").insertOne(
      {
        ...values,
      },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          console.log("country");
          console.log(values.countryName, "inserted");
        }
      }
    );
  }
  if (values.stateName && !values.districtName) {
    database.collection("mst_state").insertOne(
      {
        stateCode: values.stateCode,
        countryCode: values.countryCode,
        stateName: values.stateName,
        stateStatus: values.stateStatus,
      },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          console.log("state");
          console.log(values.stateName, "inserted");
        }
      }
    );
  }
  if (values.districtName && !values.talukaName) {
    database.collection("mst_district").insertOne(
      {
        stateCode: values.stateCode,
        countryCode: values.countryCode,
        districtName: values.districtName,
        districtCode: values.districtCode,
        districtStatus: values.districtStatus,
      },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          console.log("district");
          console.log(values.countryName, "inserted");
        }
      }
    );
  }
  if (values.talukaName) {
    database.collection("mst_taluka").insertOne(
      {
        stateCode: values.stateCode,
        countryCode: values.countryCode,
        talukaName: values.talukaName,
        districtCode: values.districtCode,
        talukaStatus: values.talukaStatus,
      },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          console.log("taluka");
          console.log(values.talukaName, "inserted");
        }
      }
    );
  }
});
app.post("/post_marketarea", verifyToken, (req, res) => {
  console.log("post request recieved at post_marketarea");
  database
    .collection("mst_accounts")
    .find({ acGroup: "EMPLOYEE" })
    .toArray((err, mst_accounts) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.json({ mst_accounts: mst_accounts });
      }
    });
});
app.post("/post_acGlGroup", verifyToken, (req, res) => {
  console.log("post request recieved at /post_acGlGroup");
  database
    .collection("mst_acglgroup")
    .find({})
    .toArray((err, mst_acglgroup) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.json({ mst_acglgroup: mst_acglgroup });
      }
    });
});
app.post("/post_acGl", verifyToken, (req, res) => {
  console.log("post request recieved at /post_acGl");
  database
    .collection("mst_acgl")
    .find({})
    .toArray((err, mst_acgl) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.json({ mst_acgl: mst_acgl });
      }
    });
});
app.post("/post_addAcGlGroup", verifyToken, (req, res) => {
  const values = req.body;
  console.log(values);
  database.collection("mst_acglgroup").insertOne({ ...values }, (err, data) => {
    if (err) {
      res.send({ err: err });
      console.log(err, "error");
    } else {
      console.log(values.glGroupName, "inserted");
    }
  });
});
app.post("/post_accounts", verifyToken, (req, res) => {
  console.log("post request recieved at /post_accounts");
  database
    .collection("mst_accounts")
    .find({})
    .toArray((err, mst_accounts) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.json({ mst_accounts: mst_accounts });
      }
    });
});
app.post("/post_mktArea", verifyToken, (req, res) => {
  console.log("post request recieved at post_mktArea");
  database
    .collection("mst_mktArea")
    .find({})
    .toArray((err, mktArea) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.json({ mktArea: mktArea });
      }
    });
});
app.post("/post_acadress", verifyToken, (req, res) => {
  console.log("post request recieved at /post_acadress");
  database
    .collection("mst_acadress")
    .find({})
    .toArray((err, acadress) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.json({ acadress: acadress });
      }
    });
});
app.post("/post_addacadress", verifyToken, (req, res) => {
  const values = req.body;
  // database.collection("mst_acadress").insertOne({ ...values }, (err, data) => {
  //   if (err) {
  //     res.send({ err: err });
  //     console.log(err, "error");
  //   } else {
  //     console.log(values.acName, "inserted");
  //   }
  // });
  console.log(values);
  database
    .collection("mst_acadress")
    .updateOne(
      { acCode: values.acCode, addressNo: values.addressNo },
      { $set: { ...values } },
      { upsert: true },
      (err, data) => {
        if (err) {
          res.send({ err: err });
          console.log(err, "error");
        } else {
          console.log(values.acName, "inserted");
        }
      }
    );
});

app.post("/post_acTypes", verifyToken, (req, res) => {
  console.log("post request recieved at /post_acadress");
  database
    .collection("mst_acTypes")
    .find({})
    .toArray((err, acTypes) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.json({ acTypes: acTypes });
      }
    });
});
app.post("/post_deptTypes", verifyToken, (req, res) => {
  console.log("post request recieved at /post_acadress");
  database
    .collection("mst_dept")
    .find({})
    .toArray((err, deptTypes) => {
      if (err) {
        res.send({ err: err });
      } else {
        res.json({ deptTypes: deptTypes });
      }
    });
});
app.get("*", (req, res) => {
  console.log("at 404 ****************");
  console.log(req.url);
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

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
// 3001 "mongodb://localhost:27017"
app.listen(PORT, () => {});

/// mongoose
//   .connect(cloudDb, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("connnection successful");
//   })
//   .catch((err) => console.log(`no connection`, err));
// Middelware
// console.log(PORT);
// $set: {
//   AllowBranchChange: values.AllowBranchChange,
//   AllowYearChange: values.AllowYearChange,
//   BranchRights: values.BranchRights,
//   ChopdaBranch: values.ChopdaBranch,
//   DefaultBranchOptions: values.DefaultBranchOptions,
//   DefaultYear: values.DefaultYear,
//   Emailid: values.Emailid,
//   GubbaColdStoragePvtLtd: values.GubbaColdStoragePvtLtd,
//   Jalgaon: values.Jalgaon,
//   Mobileno: values.Mobileno,
//   PALDHIBRANCH: values.PALDHIBRANCH,
//   Password: values.Password,
//   RePassword: values.RePassword,
//   Role: values.Role,
//   Status: values.Status,
//   userCode: values.userCode,
//   userName: values.userName,
// },

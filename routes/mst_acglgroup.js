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
const grp = [
  "Branch/Division",
  "Capital Account",
  "Loans (Liability)",
  "Suspense Account",
  "Current Liabilities",
  "Current Assets",
  "Fixed Assets",
  "Investments",
  "Sales Accounts",
  "Indirect Expenses",
  "Indirect Income",
  "Misc. Expenses",
  " Purchase Accounts",
  "Direct Income",
  "Direct Expenses",
  "Bank Accounts",
  "Bank OD A/c",
  "Cash-in-hand",
  "Deposits (Asset)",
  "Duties & Taxes",
  "Loans & Advances (Asset)",
  "Provisions",
  "Reserves & Surplus",
  "Secured Loans",
  "Stock-in-hand",
  "Sundry Creditors",
  "Sundry Debtors",
  "Unsecured Loans",
];
const prnt = [
  "Current Assets",

  "Loans (Liability)",

  "Current Assets",

  "Current Assets",

  "Current Liabilities",

  " Current Assets",
  "Current Liabilities",

  "Capital Account",

  "Loans (Liability)",

  "Current Assets",

  "Current Liabilities",

  "Current Assets",

  "Loans (Liability)",
];
const initialValues = {
  acGroupCode: "",
  parentGroupName: "",
  parentGroupCode: "",
  acGroupName: "",
  acGroupStatus: "Active",
};

router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;

  console.log("post request recieved at get accountsGroup");
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
        res.json({ mst_acglgroup: mst_acGroup });
      }
    });
});
router.put("/", verifyToken, (req, res) => {
  console.log("at put of /mst_acGroup*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  console.log(userCompanyCode);
  const values = req.body.values;
  delete values.parentGroupName;

  database
    .collection("mst_acGroup")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, mst_acGroup) => {
      if (err) {
        res.send({ err: err });
      } else {
        let usrcdarr = [];
        mst_acGroup.map((item) => {
          usrcdarr.push(parseInt(item.acGroupCode.match(/(\d+)/)[0]));
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
          ? (max = 10000)
          : (max = parseInt(getMax(usrcdarr)));
        console.log(usrcdarr, max);
        database.collection("mst_acGroup").insertOne(
          {
            ...values,
            acGroupCode: "A" + JSON.stringify(parseInt(max) + 1),
            userCompanyCode: userCompanyCode,
            entryBy: userCode,
            entryOn: new Date(),
          },
          (err, data) => {
            if (err) {
              res.send({ err: err });
            } else {
              console.log(parseInt(max) + 1, parseInt(max + 1));
              res.status(200).json({
                values: {
                  ...values,
                  acGroupCode: "A" + JSON.stringify(parseInt(max) + 1),
                },
              });
            }
          }
        );
      }
    });
});
router.patch("/", verifyToken, (req, res) => {
  console.log("at patch of /mst_acGroup*******");
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  console.log(userCode);
  const values = req.body.values;
  const acGroupCode = values.acGroupCode;
  delete values._id;
  delete values.parentGroupName;
  database.collection("mst_acGroup").updateOne(
    { acGroupCode: acGroupCode, userCompanyCode: userCompanyCode },
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
        console.log(values.acGroupCode, "updated");
        res.send({ message: `${values.acGroupCode} updated ` });
      }
    }
  );
});

router.post("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const values = req.body.item;
  database
    .collection("mst_acGroup")
    .deleteOne(
      { userCompanyCode: userCompanyCode, acGroupCode: values.acGroupCode },
      (err, data) => {
        if (err) {
          res.send({ err: err });
        } else {
          console.log(values.acGroupCode + "deleted");
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

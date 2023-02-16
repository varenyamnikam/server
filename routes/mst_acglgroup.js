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
  {
    acGroupCode: "A1001",
    parentGroupCode: "",
    acGroupName: "Branch/Division",
  },
  {
    acGroupCode: "A1002",
    parentGroupCode: "",
    acGroupName: "Capital Account",
  },
  {
    acGroupCode: "A1003",
    parentGroupCode: "",
    acGroupName: "Loans (Liability)",
  },
  {
    acGroupCode: "A1004",
    parentGroupCode: "",
    acGroupName: "Suspense Account",
  },
  {
    acGroupCode: "A1005",
    parentGroupCode: "",
    acGroupName: "Current Liabilities",
  },
  {
    acGroupCode: "A1006",
    parentGroupCode: "",
    acGroupName: "Current Assets",
  },
  {
    acGroupCode: "A1007",
    parentGroupCode: "",
    acGroupName: "Fixed Assets",
  },
  {
    acGroupCode: "A1008",
    parentGroupCode: "",
    acGroupName: "Investments",
  },
  {
    acGroupCode: "A1009",
    parentGroupCode: "",
    acGroupName: "Sales Accounts",
  },
  {
    acGroupCode: "A1010",
    parentGroupCode: "",
    acGroupName: "Indirect Expenses",
  },
  {
    acGroupCode: "A1011",
    parentGroupCode: "",
    acGroupName: "Indirect Income",
  },
  {
    acGroupCode: "A1012",
    parentGroupCode: "",
    acGroupName: "Misc. Expenses",
  },
  {
    acGroupCode: "A1013",
    parentGroupCode: "",
    acGroupName: "Purchase Accounts",
  },
  {
    acGroupCode: "A1014",
    parentGroupCode: "",
    acGroupName: "Direct Income",
  },
  {
    acGroupCode: "A1015",
    parentGroupCode: "",
    acGroupName: "Direct Expenses",
  },
  {
    acGroupCode: "A1016",
    acGroupName: "Bank Accounts",
    parentGroupCode: "Current Assets",
  },
  {
    acGroupCode: "A1017",
    acGroupName: "Bank OD A/c",
    parentGroupCode: "Loans (Liability)",
  },
  {
    acGroupCode: "A1018",
    acGroupName: "Cash-in-hand",
    parentGroupCode: "Current Assets",
  },
  {
    acGroupCode: "A1019",
    acGroupName: "Deposits (Asset)",
    parentGroupCode: "Current Assets",
  },
  {
    acGroupCode: "A1020",
    acGroupName: "Duties & Taxes",
    parentGroupCode: "Current Liabilities",
  },
  {
    acGroupCode: "A1021",
    acGroupName: "Loans & Advances (Asset)",
    parentGroupCode: "Current Assets",
  },
  {
    acGroupCode: "A1022",
    acGroupName: "Provisions",
    parentGroupCode: "Current Liabilities",
  },
  {
    acGroupCode: "A1023",
    acGroupName: "Reserves & Surplus",
    parentGroupCode: "Capital Account",
  },
  {
    acGroupCode: "A1024",
    acGroupName: "Secured Loans",
    parentGroupCode: "Loans (Liability)",
  },
  {
    acGroupCode: "A1025",
    acGroupName: "Stock-in-hand",
    parentGroupCode: "Current Assets",
  },
  {
    acGroupCode: "A1026",
    acGroupName: "Sundry Creditors",
    parentGroupCode: "Current Liabilities",
  },
  {
    acGroupCode: "A1027",
    acGroupName: "Sundry Debtors",
    parentGroupCode: "Current Assets",
  },
  {
    acGroupCode: "A1028",
    acGroupName: "Unsecured Loans",
    parentGroupCode: "Loans (Liability)",
  },
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
        function getCode(name) {
          code = "";
          grp.map((item) => {
            if (item.acGroupName == name) code = item.acGroupCode;
          });
          return code;
        }
        const insert = grp.map((item) => ({
          acGroupCode: item.acGroupCode,
          acGroupName: item.acGroupName,
          parentGroupCode: getCode(item.parentGroupCode),
        }));
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
        let usrcdarr = [];
        mst_acGroup.map((item) => {
          if (values.groupType[0] == item.groupType[0])
            usrcdarr.push(Number(item.acGroupCode.match(/(\d+)/)[0]));
        });
        function getMax(usrcdarr) {
          let x = 0;
          usrcdarr.map((item) => {
            if (item > x) {
              x = item;
            }
          });
          return x;
        }
        let max = Number(getMax(usrcdarr));
        Number(getMax(usrcdarr)) === 0
          ? (max = 1000)
          : (max = Number(getMax(usrcdarr)));
        console.log(
          "==>",
          usrcdarr,
          max,
          values.groupType[0] + JSON.stringify(max + 1)
        );
        database.collection("mst_acGroup").insertOne(
          {
            ...values,
            acGroupCode: values.groupType[0] + JSON.stringify(max + 1),
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
                  acGroupCode: values.groupType[0] + JSON.stringify(max + 1),
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

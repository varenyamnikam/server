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
function calc(arr) {
  let credit = 0;
  let debit = 0;
  arr.map((item) => {
    debit = debit + Number(item.debit);

    credit = credit + Number(item.credit);
  });
  return debit - credit;
}
const arr = [
  "Propritor",
  "Partnership",
  "Cooperative",
  "Private Limited",
  "Limited",
  "Government",
];
function cmprDate(date) {
  return new Date(date).setUTCHours(0, 0, 0, 0);
}
router.get("/", verifyToken, (req, res) => {
  const userCompanyCode = req.query.userCompanyCode;
  const userCode = req.query.userCode;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const yearCode = req.query.yearCode;
  const branchCode = req.query.branchCode;

  console.log("get request recieved at trialBalance", startDate, endDate);
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
        console.log(err);
      } else {
        database
          .collection("inv_acLedger")
          .find({ userCompanyCode: userCompanyCode })
          .toArray((err, transactions) => {
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
              .toArray((err, accounts) => {
                if (err) {
                  res.send({ err: err });
                } else {
                  //add childArr feild to mst_acGroup object
                  let allGrps = mst_acGroup.map((grp) => {
                    return {
                      ...grp,
                      childArr: [],
                      displayData: displayAcGrpData(
                        grp.acGroupCode,
                        grp.acGroupName
                      ),
                    };
                  });
                  // take grp who has parentGroup and put it in childGroup
                  //of that prntGrp
                  function updateParentGroup(childGroup, parentGroupCode) {
                    mst_acGroup.map((item, i) => {
                      if (item.acGroupCode == parentGroupCode) {
                        //ad balance of child to parent grp
                        let updatedParentGroup = allGrps[i];
                        updatedParentGroup.displayData.openingBalance +=
                          childGroup.displayData.openingBalance;
                        updatedParentGroup.displayData.monthlyBalance +=
                          childGroup.displayData.monthlyBalance;
                        //add child to childArr of parentGrp
                        updatedParentGroup.displayData.closingBalance +=
                          childGroup.displayData.closingBalance;

                        updatedParentGroup.childArr.push(childGroup);
                        allGrps[i] = updatedParentGroup;
                      }
                    });
                  }

                  allGrps.map((item) => {
                    if (item.parentGroupCode) {
                      updateParentGroup(item, item.parentGroupCode);
                    }
                  });

                  function getAcGrpCode(code) {
                    let found = accounts.find((item) => item.acCode == code);
                    found = found ? found.acGroupCode : "";
                    return found;
                  }
                  function displayAcGrpData(grpCode, grpName) {
                    let prev = transactions.filter(
                      (item) =>
                        cmprDate(item.vouDate) < cmprDate(startDate) &&
                        item.vouNo.slice(6, 10) == yearCode &&
                        item.vouNo.slice(0, 4) == branchCode &&
                        getAcGrpCode(item.acCode) == grpCode
                    );
                    let openingBalance = 0;
                    if (prev.length !== 0) openingBalance = calc(prev);

                    let monthlyTrans = transactions.filter((item) => {
                      return (
                        cmprDate(item.vouDate) >= cmprDate(startDate) &&
                        cmprDate(item.vouDate) <= cmprDate(endDate) &&
                        item.vouNo.slice(6, 10) == yearCode &&
                        item.vouNo.slice(0, 4) == branchCode &&
                        getAcGrpCode(item.acCode) == grpCode
                      );
                    });
                    let monthlyBalance = 0;
                    if (monthlyTrans.length !== 0)
                      monthlyBalance = calc(monthlyTrans);
                    const accountsOfAcGrp = accounts.filter(
                      (item) => getAcGrpCode(item.acCode) == grpCode
                    );
                    let accData;
                    if (accountsOfAcGrp.length !== 0)
                      accData = accountsOfAcGrp.map((item) => {
                        return displayAccData(item.acCode, item.acName);
                      });
                    else accData = [];
                    return {
                      acGroupCode: grpCode,
                      acGroupName: grpName,
                      openingBalance: openingBalance,
                      accData: accData,
                      monthlyBalance: monthlyBalance,
                      closingBalance: openingBalance + monthlyBalance,
                    };
                  }
                  function displayAccData(acCode, acName) {
                    let prev = transactions.filter(
                      (item) =>
                        cmprDate(item.vouDate) < cmprDate(startDate) &&
                        item.vouNo.slice(6, 10) == yearCode &&
                        item.vouNo.slice(0, 4) == branchCode &&
                        item.acCode == acCode
                    );
                    let openingBalance = 0;
                    if (prev.length !== 0) openingBalance = calc(prev);

                    let monthlyTrans = transactions.filter((item) => {
                      return (
                        cmprDate(item.vouDate) >= cmprDate(startDate) &&
                        cmprDate(item.vouDate) <= cmprDate(endDate) &&
                        item.vouNo.slice(6, 10) == yearCode &&
                        item.vouNo.slice(0, 4) == branchCode &&
                        item.acCode == acCode
                      );
                    });
                    let monthlyBalance = 0;
                    if (monthlyTrans.length !== 0)
                      monthlyBalance = calc(monthlyTrans);

                    return {
                      acCode: acCode,
                      acName: acName,
                      openingBalance: openingBalance,
                      monthlyBalance: monthlyBalance,
                      closingBalance: openingBalance + monthlyBalance,
                    };
                  }

                  allGrps = allGrps.filter((item) => !item.parentGroupCode);
                  res.json({
                    mst_acGroup: mst_acGroup,
                    allGrps: allGrps,
                  });
                }
              });
          });
      }
    });
});
router.post("/", verifyToken, (req, res) => {
  const userCompanyCode = req.body.userCompanyCode;
  const yearCode = req.body.yearCode;
  const branchCode = req.body.branchCode;
  const acCode = req.body.acCode;

  console.log(
    "post request recieved at stockReports",
    userCompanyCode,
    yearCode,
    branchCode,
    acCode
  );

  database
    .collection("inv_acLedger")
    .find({ userCompanyCode: userCompanyCode })
    .toArray((err, transactions) => {
      if (err) {
        res.send({ err: err });
      } else {
        let prev = transactions.filter(
          (item) =>
            cmprDate(item.vouDate) <= new Date().setUTCHours(0, 0, 0, 0) &&
            item.vouNo.slice(6, 10) == yearCode &&
            item.vouNo.slice(0, 4) == branchCode &&
            item.acCode == acCode
        );
        let balance = 0;
        if (prev.length !== 0) balance = calc(prev);
        console.log(prev, balance);
        res.json({
          balance: balance,
        });
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
///useless code
// const reduced = transactions.reduce((prev, curr) => {
//   let found = prev.find((item) => item.acCode == curr.acCode);
//   if (!found) prev.push(curr.acCode);
//   return prev;
// }, []);
// let grpArr = [];
// reduced.map((item) => {
//   grpArr.push(getAcGrpCode(item));
// });

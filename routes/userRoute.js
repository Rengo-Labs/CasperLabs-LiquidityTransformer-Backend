require("dotenv").config();
const express = require("express");
const router = express.Router();
var wise = require("../JsClients/WISETOKEN/wiseTokenFunctionsForBackend/functions");
const {utils} =require("../JsClients/LIQUIDITYTRANSFORMER/src");
const sdk = require('casper-js-sdk');
const { CasperServiceByJsonRPC } = sdk;
const cc = new CasperServiceByJsonRPC(process.env.NODE_ADDRESS);

const fetchUrefValue = async (uref) => {
  const stateRootHash = await cc.getStateRootHash();

  const value = await cc.getBlockState(
    stateRootHash, 
    uref
  );
  return value;
}

router.route("/wiseBalanceAgainstUser").post(async function (req, res, next) {
  try {
    if (!req.body.contractHash) {
      return res.status(400).json({
        success: false,
        message: "contractHash not found in request body",
      });
    }

    if (!req.body.user) {
      return res.status(400).json({
        success: false,
        message: "user not found in request body",
      });
    }

    let balance = await wise.balanceOf(req.body.contractHash, req.body.user);
    return res.status(200).json({
      success: true,
      message: "Balance has been found against this user.",
      balance: balance,
    });
  } catch (error) {
    console.log("error (try-catch) : " + error);
    return res.status(500).json({
      success: false,
      err: error,
    });
  }
});

router.route("/queryUserKeys").post(async function (req, res, next) {
  try {
    if (!req.body.user) {
      return res.status(400).json({
        success: false,
        message: "user not found in request body",
      });
    }

    let accountInfo = await utils.getAccountInfoForBackend(process.env.NODE_ADDRESS, req.body.user);
    console.log(`... Account Info: `);
	  console.log(JSON.stringify(accountInfo, null, 2));

    return res.status(200).json({
      success: true,
      message: "User keys data has been fetched...",
      Data:accountInfo,
    });
  } catch (error) {
    console.log("error (try-catch) : " + error);
    return res.status(500).json({
      success: false,
      err: error,
    });
  }
});

router.route("/queryKeyData").post(async function (req, res, next) {
  try {
    if (!req.body.user) {
      return res.status(400).json({
        success: false,
        message: "user not found in request body",
      });
    }
    if (!req.body.keyToQuery) {
      return res.status(400).json({
        success: false,
        message: "keyToQuery not found in request body",
      });
    }

    let accountInfo = await utils.getAccountInfoForBackend(process.env.NODE_ADDRESS, req.body.user);

    const data = await utils.getAccountNamedKeyValue(
      accountInfo,
      req.body.keyToQuery
    );
    
    let urefValue= await fetchUrefValue(data);
    console.log("urefValue: ",urefValue);
    
    return res.status(200).json({
      success: true,
      message: req.body.keyToQuery+" key data has been fetched...",
      Data:urefValue.CLValue,
    });
  } catch (error) {
    console.log("error (try-catch) : " + error);
    return res.status(500).json({
      success: false,
      err: error,
    });
  }
});

module.exports = router;

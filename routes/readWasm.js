require("dotenv").config();
var express = require("express");
var router = express.Router();
var liquidityTransformerJsClient=require('../JsClients/LIQUIDITYTRANSFORMER/src/utils');
var wiseTokenJsClient=require('../JsClients/WISETOKEN/src/utils');

router.route("/getLiquidityTransformerSessionCodeWasmData").get(async function (req, res, next) {
  try {

    let wasmData= liquidityTransformerJsClient.getWasmDataInBuffer('Scripts/LIQUIDITYTRANSFORMER/wasm/session-code-lt.wasm');
    console.log(wasmData);
    
    return res.status(200).json({
        success: true,
        message: "Liquidity Transformer session code wasm data successfully read and converted. ",
        wasmData: wasmData,
    });
    
  } catch (error) {
    console.log("error (try-catch) : " + error);
    return res.status(500).json({
      success: false,
      err: error,
    });
  }
});

router.route("/getWiseTokenSessionCodeWasmData").get(async function (req, res, next) {
  try {

    let wasmData= wiseTokenJsClient.getWasmDataInBuffer('Scripts/WISETOKEN/wasm/session-code-wise.wasm');
    console.log(wasmData);
    
    return res.status(200).json({
        success: true,
        message: "WiseToken session code wasm data successfully read and converted. ",
        wasmData: wasmData,
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

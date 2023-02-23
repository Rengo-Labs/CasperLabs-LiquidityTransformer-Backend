require("dotenv").config();
var express = require("express");
var router = express.Router();
var {encodeBase16} = require("casper-js-sdk");
var utils = require("../JsClients/LIQUIDITYTRANSFORMER/src/utils");
var allcontractsDataModel = require("../models/allcontractsData");

const contractSimpleGetter = async (
	nodeAddress,
	contractHash,
	key
) => {
	const stateRootHash = await utils.getStateRootHash(nodeAddress);
	const clValue = await utils.getContractData(
		nodeAddress,
		stateRootHash,
		contractHash,
		key
	);
	return clValue.CLValue;
};

const callSimpleGetterForReserves = async (contractHash,key) => {
    const result = await contractSimpleGetter(
        process.env.NODE_ADDRESS,
        contractHash,
        [key]
    );
    console.log("parseInt(result.data._hex): ",parseInt(result.data._hex));
    return parseInt(result.data._hex);
};
const callSimpleGetterForTokens = async (contractHash,key) => {
    const result = await contractSimpleGetter(
      process.env.NODE_ADDRESS,
      contractHash,
      [key]
    );
    console.log("result.data(): ",encodeBase16(Uint8Array.from(Buffer.from(result.data.data, "hex"))));
    return encodeBase16(Uint8Array.from(Buffer.from(result.data.data, "hex")));
};

router.route("/getWISEPERWCSPRRatio").get(async function (req, res, next) {
  try {
    let WISESCSPRData = await allcontractsDataModel.findOne({packageHash:process.env.WISE_PAIR_PACKAGE_HASH});
    let SCSPRWCSPRData = await allcontractsDataModel.findOne({packageHash:process.env.PAIR_PACKAGE_HASH});
    if(WISESCSPRData == null)
    {
        return res.status(400).json({
            success: false,
            message: "WISE and SCSPR pair not found."
        });
    }
    else if(SCSPRWCSPRData == null)
    {
        return res.status(400).json({
            success: false,
            message: "SCSPR and WCSPR pair not found."
        });
    }
    else{

        let WISESCSPRReserve0 = await callSimpleGetterForReserves(WISESCSPRData.contractHash,"reserve0");
        let WISESCSPRReserve1 = await callSimpleGetterForReserves(WISESCSPRData.contractHash,"reserve1");
        let WISESCSPRToken0 = await callSimpleGetterForTokens(WISESCSPRData.contractHash,"token0");
        let WISESCSPRToken1 = await callSimpleGetterForTokens(WISESCSPRData.contractHash,"token1");

        let SCSPRWCSPRReserve0 = await callSimpleGetterForReserves(SCSPRWCSPRData.contractHash,"reserve0");
        let SCSPRWCSPRReserve1 = await callSimpleGetterForReserves(SCSPRWCSPRData.contractHash,"reserve1");
        let SCSPRWCSPRToken0 = await callSimpleGetterForTokens(SCSPRWCSPRData.contractHash,"token0");
        let SCSPRWCSPRToken1 = await callSimpleGetterForTokens(SCSPRWCSPRData.contractHash,"token1");

        let WISEWCSPRRatio;
        if(WISESCSPRToken0 == process.env.WISETOKEN_PACKAGE_HASH)
        {
            if(WISESCSPRToken1 == process.env.SYNTHETIC_CSPR_PACKAGE)
            {
                if(SCSPRWCSPRToken0 == process.env.WCSPR_PACKAGE)
                {
                    if(SCSPRWCSPRToken1 == process.env.SYNTHETIC_CSPR_PACKAGE)
                    {
                       WISEWCSPRRatio=(WISESCSPRReserve1/WISESCSPRReserve0) * (SCSPRWCSPRReserve0/SCSPRWCSPRReserve1);
                       console.log("WISE Per WCSPR: ",WISEWCSPRRatio);
                    }
                }
                else if(SCSPRWCSPRToken0 == process.env.SYNTHETIC_CSPR_PACKAGE)
                {
                    if(SCSPRWCSPRToken1 == process.env.WCSPR_PACKAGE)
                    {
                        WISEWCSPRRatio=(WISESCSPRReserve1/WISESCSPRReserve0) *  (SCSPRWCSPRReserve1/SCSPRWCSPRReserve0);
                        console.log("WISE Per WCSPR: ",WISEWCSPRRatio);
                    }
                }
            }
        }
        else if (WISESCSPRToken0 == process.env.SYNTHETIC_CSPR_PACKAGE){
            if(WISESCSPRToken1 == process.env.WISETOKEN_PACKAGE_HASH)
            {
                if(SCSPRWCSPRToken0 == process.env.WCSPR_PACKAGE)
                {
                    if(SCSPRWCSPRToken1 == process.env.SYNTHETIC_CSPR_PACKAGE)
                    {
                        WISEWCSPRRatio=(WISESCSPRReserve0/WISESCSPRReserve1) * (SCSPRWCSPRReserve0/SCSPRWCSPRReserve1);
                        console.log("WISE Per WCSPR: ",WISEWCSPRRatio);
                    }
                }
                else if(SCSPRWCSPRToken0 == process.env.SYNTHETIC_CSPR_PACKAGE)
                {
                    if(SCSPRWCSPRToken1 == process.env.WCSPR_PACKAGE)
                    {
                        WISEWCSPRRatio=(WISESCSPRReserve0/WISESCSPRReserve1) * (SCSPRWCSPRReserve1/SCSPRWCSPRReserve0);
                        console.log("WISE Per WCSPR: ",WISEWCSPRRatio);
                    }
                }
            }
        }
        return res.status(200).json({
            success: true,
            message: "Ratio of WISE with WCSPR calculated.",
            WISEPerWCSPR: WISEWCSPRRatio
        });
    }
  } catch (error) {
    console.log("error (try-catch) : " + error);
    return res.status(500).json({
      success: false,
      err: error,
    });
  }
});

module.exports = router;

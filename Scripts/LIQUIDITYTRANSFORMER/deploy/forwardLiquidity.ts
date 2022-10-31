import { config } from "dotenv";
config();
import { LIQUIDITYClient } from "../../../JsClients/LIQUIDITYTRANSFORMER/src";
import { getDeploy,sleep } from "./utils";

import { 
	Keys
} from "casper-js-sdk";

const {
	NODE_ADDRESS,
	EVENT_STREAM_ADDRESS,
	CHAIN_NAME,
	LIQUIDITYTRANSFORMER_FUNCTIONS_PAYMENT_AMOUNT,
	LIQUIDITYTRANSFORMER_CONTRACT_HASH,
	LT_FORWARD_LIQUIDITY_TIMESTAMP,
	DAVID_SECRET_KEY
} = process.env;

const KEYS1 = Keys.getKeysFromHexPrivKey(
	DAVID_SECRET_KEY!,
	Keys.SignatureAlgorithm.Ed25519
);

const callForwardLiquidity = async () => {

	const liquidity = new LIQUIDITYClient(
		NODE_ADDRESS!,
		CHAIN_NAME!,
		EVENT_STREAM_ADDRESS!
	);

	console.log("Liquidity Transformer contract Hash: ",LIQUIDITYTRANSFORMER_CONTRACT_HASH!);
	await liquidity.setContractHash(LIQUIDITYTRANSFORMER_CONTRACT_HASH!);

	/* Forward Liquidity */
	// -- Prerequisite Calls --
	// set_wise						scspr => wise
	// set_white_list				factory => router 
	// set_liquidity_transfomer		wise
	// reserve_wise					liquidity_transfomer

	// This flow is being called
	const forwardLiquidity = await liquidity.forwardLiquidity(
		KEYS1,
		LIQUIDITYTRANSFORMER_FUNCTIONS_PAYMENT_AMOUNT!
	);
	console.log("... forwardLiquidity deploy hash: ", forwardLiquidity);

};

async function checkingTimeToCallForwardLiquidity()
{	
	let forwardLiquidityTime= parseInt(LT_FORWARD_LIQUIDITY_TIMESTAMP!);
	console.log("forwardLiquidityTime: ",forwardLiquidityTime);
	while((new Date().getTime()) <= forwardLiquidityTime)
	{
		console.log("Checking for right time to call forward Liquidity...");
        await sleep(300000);// wait for 5 minutes than recheck
	}
	callForwardLiquidity(); // call it when currentTime gets greater than forwardLiquidity call time
}

checkingTimeToCallForwardLiquidity();


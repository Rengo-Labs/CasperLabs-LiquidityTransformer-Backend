import { config } from "dotenv";
config();
import { LIQUIDITYClient, utils, constants } from "../../../JsClients/LIQUIDITYTRANSFORMER/src";
import { parseTokenMeta, sleep, getDeploy } from "./utils";

import { Keys } from "casper-js-sdk";

const {
	NODE_ADDRESS,
	EVENT_STREAM_ADDRESS,
	CHAIN_NAME,
	LIQUIDITYTRANSFORMER_WASM_PATH,
	LIQUIDITYTRANSFORMER_MASTER_KEY_PAIR_PATH,
	LIQUIDITYTRANSFORMER_INSTALL_PAYMENT_AMOUNT,
	LIQUIDITYTRANSFORMER_CONTRACT_NAME,
	WCSPR_PACKAGE,
	SYNTHETIC_CSPR_PACKAGE,
	PAIR_PACKAGE_HASH,
	ROUTER_ADDRESS,
	ROUTER_PACKAGE_HASH,
	WISETOKEN_PACKAGE_HASH
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
	`${LIQUIDITYTRANSFORMER_MASTER_KEY_PAIR_PATH}/public_key.pem`,
	`${LIQUIDITYTRANSFORMER_MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

const test = async () => {
	const liquidity = new LIQUIDITYClient(
		NODE_ADDRESS!,
		CHAIN_NAME!,
		EVENT_STREAM_ADDRESS!
	);

	const installDeployHash = await liquidity.install(
		KEYS,
		WCSPR_PACKAGE!,
		SYNTHETIC_CSPR_PACKAGE!,
		PAIR_PACKAGE_HASH!,
		ROUTER_ADDRESS!,
		ROUTER_PACKAGE_HASH!,
		WISETOKEN_PACKAGE_HASH!,
		LIQUIDITYTRANSFORMER_CONTRACT_NAME!,
		LIQUIDITYTRANSFORMER_INSTALL_PAYMENT_AMOUNT!,
		LIQUIDITYTRANSFORMER_WASM_PATH!
	);

	console.log(`... Contract installation deployHash: ${installDeployHash}`);

	await getDeploy(NODE_ADDRESS!, installDeployHash);

	console.log(`... Contract installed successfully.`);

	let accountInfo = await utils.getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);

	console.log(`... Account Info: `);
	console.log(JSON.stringify(accountInfo, null, 2));

	const contractHash = await utils.getAccountNamedKeyValue(
		accountInfo,
		`${LIQUIDITYTRANSFORMER_CONTRACT_NAME!}_contract_hash`
	);

	console.log(`... Contract Hash: ${contractHash}`);

	const packageHash = await utils.getAccountNamedKeyValue(
		accountInfo,
		`${LIQUIDITYTRANSFORMER_CONTRACT_NAME!}_package_hash`
	);
	
	console.log(`... Package Hash: ${packageHash}`);
};

//test();

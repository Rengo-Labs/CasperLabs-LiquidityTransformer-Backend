import { config } from "dotenv";
config();
import { WISETokenClient, utils, constants } from "../src";
import { parseTokenMeta, sleep, getDeploy } from "./utils";

import { Keys } from "casper-js-sdk";

const {
	NODE_ADDRESS,
	EVENT_STREAM_ADDRESS,
	CHAIN_NAME,
	WISETOKEN_WASM_PATH,
	WISETOKEN_MASTER_KEY_PAIR_PATH,
	WISETOKEN_INSTALL_PAYMENT_AMOUNT,
	WISETOKEN_CONTRACT_NAME,
	WCSPR_ADDRESS,
	SYNTHETIC_CSPR_ADDRESS,
	PAIR_ADDRESS,
	ROUTER_ADDRESS,
	FACTORY_ADDRESS,
	LIQUIDITY_GUARD_ADDRESS,
	LAUNCH_TIME
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
	`${WISETOKEN_MASTER_KEY_PAIR_PATH}/public_key.pem`,
	`${WISETOKEN_MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

const test = async () => {
	const wise = new WISETokenClient(
		NODE_ADDRESS!,
		CHAIN_NAME!,
		EVENT_STREAM_ADDRESS!
	);
	
	const installDeployHash = await wise.install(
		KEYS,
		WCSPR_ADDRESS!,
		SYNTHETIC_CSPR_ADDRESS!,
		PAIR_ADDRESS!,
		ROUTER_ADDRESS!,
		FACTORY_ADDRESS!,
		LIQUIDITY_GUARD_ADDRESS!,
		LAUNCH_TIME!,
		WISETOKEN_CONTRACT_NAME!,
		WISETOKEN_INSTALL_PAYMENT_AMOUNT!,
		WISETOKEN_WASM_PATH!
	);

	console.log(`... Contract installation deployHash: ${installDeployHash}`);

	await getDeploy(NODE_ADDRESS!, installDeployHash);

	console.log(`... Contract installed successfully.`);

	let accountInfo = await utils.getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);

	console.log(`... Account Info: `);
	console.log(JSON.stringify(accountInfo, null, 2));

	const contractHash = await utils.getAccountNamedKeyValue(
		accountInfo,
		`${WISETOKEN_CONTRACT_NAME!}_contract_hash`
	);

	console.log(`... Contract Hash: ${contractHash}`);

	const packageHash = await utils.getAccountNamedKeyValue(
		accountInfo,
		`${WISETOKEN_CONTRACT_NAME!}_package_hash`
	);
	
	console.log(`... Package Hash: ${packageHash}`);
};

//test();

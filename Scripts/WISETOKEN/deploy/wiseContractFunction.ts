import { config } from "dotenv";
config();
import { WISETokenClient, utils, constants } from "../../../JsClients/WISETOKEN/src";
import { parseTokenMeta, sleep, getDeploy } from "./utils";

import {
	CLValueBuilder,
	Keys,
	CLPublicKey,
	CLAccountHash,
	CLPublicKeyType,
	CLURef,
	decodeBase16,
	AccessRights,
	CLByteArray
} from "casper-js-sdk";

const { WISEEvents } = constants;

const {
	NODE_ADDRESS,
	EVENT_STREAM_ADDRESS,
	CHAIN_NAME,
	WISETOKEN_WASM_PATH,
	WISETOKEN_MASTER_KEY_PAIR_PATH,
	RECEIVER_ACCOUNT_ONE,
	INSTALL_PAYMENT_AMOUNT,
	SET_FEE_TO_PAYMENT_AMOUNT,
	SET_FEE_TO_SETTER_PAYMENT_AMOUNT,
	CREATE_PAIR_PAYMENT_AMOUNT,
	WISETOKEN_CONTRACT_NAME,
	RESERVE_WISE_PAYMENT_AMOUNT,
	IMMUTABLE_TRANSFORMER,
	TRANSFORMER_PURSE,
	EQUALIZER_ADDRESS,
	STABLE_USD_EQUIVALENT_CONTRACT_HASH,
	INVESTOR_ADDRESS,
	AMOUNT,
	LOCK_DAYS,
	PURSE,
	TOKEN_ADDRESS,
	STAKED_AMOUNT,
	WISE_FUNCTIONS_INSTALL_PAYMENT_AMOUNT,
	WISETOKEN_CONTRACT_HASH,
	WISETOKEN_PACKAGE_HASH,
	CALLER_PURSE,
	TOKEN_AMOUNT,
	TOKEN_ADRESS,
	STAKE_ID,
	SCRAPE_DAYS
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
	`${WISETOKEN_MASTER_KEY_PAIR_PATH}/public_key.pem`,
	`${WISETOKEN_MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

const wise = new WISETokenClient(
	NODE_ADDRESS!,
	CHAIN_NAME!,
	EVENT_STREAM_ADDRESS!
);

const test = async () => {
	
	await wise.setContractHash(WISETOKEN_CONTRACT_HASH!);

	//mint
	const createPairDeployHash = await wise.createPair(
		KEYS,
		WISE_FUNCTIONS_INSTALL_PAYMENT_AMOUNT!
	);
	console.log("...create pair deploy hash: ", createPairDeployHash);
	
	await getDeploy(NODE_ADDRESS!, createPairDeployHash);
	console.log("... Wise pair with WCSPR created successfully.");

	// const _refferer = new CLByteArray(
	// 	Uint8Array.from(Buffer.from("7eb6fb7fb5c61de23f296f0accc2d4bda83e7c2a4e95d18d5f466c783b1e2219", "hex"))
	// );

	//mint
	// const mintDeployHash = await wise.mint(
	// 	KEYS,
	// 	KEYS.publicKey,
	// 	"10000000000000000000000000000000000000000000000",
	// 	WISE_FUNCTIONS_INSTALL_PAYMENT_AMOUNT!
	// );
	// console.log("...Wise Mint deploy hash: ", mintDeployHash);
	
	// await getDeploy(NODE_ADDRESS!, mintDeployHash);
	// console.log("... Token minted successfully.");

	//setStableUSD
	// const setBusd = await wise.setStableUsd(
	// 	KEYS,
	// 	STABLE_USD_EQUIVALENT_CONTRACT_HASH!,
	// 	RESERVE_WISE_PAYMENT_AMOUNT!
	// );
	// console.log("... setBusd deploy hash: ", setBusd);
	// await getDeploy(NODE_ADDRESS!, setBusd);
	// console.log("... setBusd called successfully");

	// set_stable_usd_equivalent
	// mint staked amount wise to stakerid
	// set_scspr
	// set_allow_deposit
	// need to create pairs and add liquidity for this path (stakeable,scspr,wcspr,stable_usd)
	
	// const createStakedeployHash = await wise.createStakeJsclient(
	// 	KEYS,
	// 	STAKED_AMOUNT!,
	// 	LOCK_DAYS!,
	// 	"e76579a8c3ddacf321d4634588833d5882e13df0c8d2e91f1ca535c16c9dbbfa",
	// 	WISE_FUNCTIONS_INSTALL_PAYMENT_AMOUNT!
	// );
	// console.log(`... Contract createStake deployHash : ${createStakedeployHash}`);

	// await getDeploy(NODE_ADDRESS!, createStakedeployHash);
	// console.log("... Stake called successfully");

	// const createStakeWithCsprdeployHash = await wise.createStakeWithCsprJsclient(
	// 	KEYS,
	// 	LOCK_DAYS!,
	// 	"e76579a8c3ddacf321d4634588833d5882e13df0c8d2e91f1ca535c16c9dbbfa",
	// 	STAKED_AMOUNT!,
	// 	CALLER_PURSE!,
	// 	WISE_FUNCTIONS_INSTALL_PAYMENT_AMOUNT!
	// );
	// console.log(`... Contract createStakeWithCspr deployHash : ${createStakeWithCsprdeployHash}`);

	// await getDeploy(NODE_ADDRESS!, createStakeWithCsprdeployHash);
	// console.log("... Stake with Cspr called successfully");

	// const createStakeWithTokendeployHash = await wise.createStakeWithTokenJsclient(
	// 	KEYS,
	// 	TOKEN_ADRESS!,
	// 	TOKEN_AMOUNT!,
	// 	LOCK_DAYS!,
	// 	"e76579a8c3ddacf321d4634588833d5882e13df0c8d2e91f1ca535c16c9dbbfa",
	// 	WISE_FUNCTIONS_INSTALL_PAYMENT_AMOUNT!
	// );
	// console.log(`... Contract createStakeWithToken deployHash : ${createStakeWithTokendeployHash}`);

	// await getDeploy(NODE_ADDRESS!, createStakeWithTokendeployHash);
	// console.log("... Stake WithToken called successfully");
	
	//first createstake
	// const endStakedeployHash = await wise.endStakeJsclient(
	// 	KEYS,
	// 	STAKE_ID!,
	// 	WISE_FUNCTIONS_INSTALL_PAYMENT_AMOUNT!
	// );
	// console.log(`... Contract endStake deployHash : ${endStakedeployHash}`);

	// await getDeploy(NODE_ADDRESS!, endStakedeployHash);
	// console.log("...endStake called successfully");

	//first createstake
	// const scrapeInterestdeployHash = await wise.scrapeInterestJsclient(
	// 	KEYS,
	// 	STAKE_ID!,
	// 	SCRAPE_DAYS!,
	// 	WISE_FUNCTIONS_INSTALL_PAYMENT_AMOUNT!
	// );
	// console.log(`... Contract scrapeInterest deployHash : ${scrapeInterestdeployHash}`);

	// await getDeploy(NODE_ADDRESS!, scrapeInterestdeployHash);
	// console.log("...scrapeInterest called successfully");

	// const setLiquidityTransfomer = await wise.setLiquidityTransfomer(
	// 	KEYS,
	// 	IMMUTABLE_TRANSFORMER!,
	// 	TRANSFORMER_PURSE!,
	// 	RESERVE_WISE_PAYMENT_AMOUNT!
	// );
	// console.log(
	// 	"... setLiquidityTransfomer deploy hash: ",
	// 	setLiquidityTransfomer
	// );
	// await getDeploy(NODE_ADDRESS!, setLiquidityTransfomer);
	// console.log("... setLiquidityTransfomer created successfully");

	// const renounceKeeper = await wise.renounceKeeper(
	// 	KEYS,
	// 	RESERVE_WISE_PAYMENT_AMOUNT!
	// );
	// console.log("... renounceKeeper deploy hash: ", renounceKeeper);
	// await getDeploy(NODE_ADDRESS!, renounceKeeper);
	// console.log(".PURSE.. renounceKeeper createINVESTMENT_DAYd successfully");

	// const mintSupply = await wise.mintSupply(
	// 	KEYS,
	// 	INVESTOR_ADDRESS!,
	// 	AMOUNT!,
	// 	RESERVE_WISE_PAYMENT_AMOUNT!
	// );
	// console.log("... mintSupply deploy hash: ", mintSupply);
	// await getDeploy(NODE_ADDRESS!, mintSupply);
	// console.log("... mintSupply created successfully");

	// const extendLtAuction = await wise.extendLtAuction(
	// 	KEYS,
	// 	RESERVE_WISE_PAYMENT_AMOUNT!
	// );
	// console.log("... extendLtAuction deploy hash: ", extendLtAuction);
	// await getDeploy(NODE_ADDRESS!, extendLtAuction);
	// console.log("... extendLtAuction created successfully");

	// /*=========================Getters=========================*/
	// const LOCKDAYS = CLValueBuilder.u64(LOCK_DAYS);
	// const _AMOUNT = CLValueBuilder.u256(AMOUNT);
	// const TOKENAMOUNT = CLValueBuilder.u256(TOKEN_AMOUNT);

	// const _PURSE = new CLURef(decodeBase16(PURSE), AccessRights.READ_ADD_WRITE);
	// const createStakeWithBnb = await wise.createStakeWithBnb(
	// 	LOCKDAYS,
	// 	KEYS.publicKey,
	// 	_AMOUNT,
	// 	_PURSE
	// );
	// console.log(`... Contract createStakeWithBnb: ${createStakeWithBnb}`);

	// const createStakeWithToken = await wise.createStakeWithToken(
	// 	KEYS.publicKey,
	// 	TOKENAMOUNT,
	// 	LOCKDAYS,
	// 	KEYS.publicKey
	// );
	// console.log(`... Contract createStakeWithToken: ${createStakeWithToken}`);

	// const getPairAddress = await wise.getPairAddress();
	// console.log(`... Contract getPairAddress: ${getPairAddress}`);

	// const getTotalStaked = await wise.getTotalStaked();
	// console.log(`... Contract getTotalStaked: ${getTotalStaked}`);

	// const getLiquidityTransformer = await wise.getLiquidityTransformer();
	// console.log(
	// 	`... Contract getLiquidityTransformer: ${getLiquidityTransformer}`
	// );

	// const getSyntheticTokenAddress = await wise.getSyntheticTokenAddress();
	// console.log(
	// 	`... Contract getSyntheticTokenAddress: ${getSyntheticTokenAddress}`
	// );

};

//test();
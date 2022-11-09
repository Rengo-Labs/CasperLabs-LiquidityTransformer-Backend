import {
	CasperClient,
	CLPublicKey,
	CLAccountHash,
	CLByteArray,
	CLKey,
	CLString,
	CLTypeBuilder,
	CLValue,
	CLValueBuilder,
	CLValueParsers,
	CLMap,
	DeployUtil,
	EventName,
	EventStream,
	Keys,
	RuntimeArgs,
	CLURef,
	decodeBase16,
	AccessRights,
	CLU64,
	CLU256,
	CLList,
	CLU32
} from "casper-js-sdk";
import * as utils from "./utils";
import { RecipientType, IPendingDeploy } from "./types";
import * as blake from "blakejs";
import { concat } from "@ethersproject/bytes";
import {createRecipientAddress } from "./utils";

class WISETokenClient {

	private contractName: string="Wise_Token";
	private contractHash: string="Wise_Token";
	private contractPackageHash: string="Wise_Token";

	private namedKeys: {
		balances:string
		metadata: string;
		nonces: string;
		allowances: string;
		ownedTokens: string;
		owners: string;
		paused: string;
		
	};

	private isListening = false;
	private pendingDeploys: IPendingDeploy[] = [];
  
	constructor(
  
	  private nodeAddress: string,
	  private chainName: string,
	  private eventStreamAddress?: string,
	  
	) 
	{
	  this.namedKeys= {
		balances:"null",
		metadata: "null",
		nonces: "null",
		allowances: "null",
		ownedTokens: "null",
		owners: "null",
		paused: "null"
	  }; 
	}
  

	public async install(
		keys: Keys.AsymmetricKey,
		wcsprAddress: string,
		syntheticCsprAddress: string,
		pairAddress: string,
		routerAddress: string,
		factoryAddress: string,
		liquidityguardAddress: string,
		launchtime: string,
		contractName: string,
		paymentAmount: string,
		wasmPath: string
	) {
		const wcspr_contract = new CLByteArray(
			Uint8Array.from(Buffer.from(wcsprAddress, "hex"))
		);
		const scspr_contract = new CLByteArray(
			Uint8Array.from(Buffer.from(syntheticCsprAddress, "hex"))
		);
		const pair_contract = new CLByteArray(
			Uint8Array.from(Buffer.from(pairAddress, "hex"))
		);
		const router_contract = new CLByteArray(
			Uint8Array.from(Buffer.from(routerAddress, "hex"))
		);
		const factory_contract = new CLByteArray(
			Uint8Array.from(Buffer.from(factoryAddress, "hex"))
		);
		const liquidity_guard_contract = new CLByteArray(
			Uint8Array.from(Buffer.from(liquidityguardAddress, "hex"))
		);
		
		const runtimeArgs = RuntimeArgs.fromMap({
			wcspr: CLValueBuilder.key(wcspr_contract),
			scspr: CLValueBuilder.key(scspr_contract),
			pair: CLValueBuilder.key(pair_contract),
			router: CLValueBuilder.key(router_contract),
			factory: CLValueBuilder.key(factory_contract),
			liquidity_guard: CLValueBuilder.key(liquidity_guard_contract),
			launch_time: CLValueBuilder.u256(launchtime),
			contract_name: CLValueBuilder.string(contractName),
		});

		const deployHash = await installWasmFile({
			chainName: this.chainName,
			paymentAmount,
			nodeAddress: this.nodeAddress,
			keys,
			pathToContract: wasmPath,
			runtimeArgs,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Problem with installation");
		}
	}
	public async setLiquidityTransformerWithSessionCode(
		keys: Keys.AsymmetricKey,
		packageHash: string,
		entrypointName:string,
		ltPackageHash: string,
		paymentAmount: string,
		wasmPath: string
	  ) 
	{
		const _packageHash = new CLByteArray(
				Uint8Array.from(Buffer.from(packageHash, "hex"))
		);
		const _ltPackageHash = new CLByteArray(
			Uint8Array.from(Buffer.from(ltPackageHash, "hex"))
		);
		const runtimeArgs = RuntimeArgs.fromMap({
		  package_hash: utils.createRecipientAddress(_packageHash),
		  entrypoint: CLValueBuilder.string(entrypointName),
		  immutable_transformer: CLValueBuilder.key(_ltPackageHash),
		});
	
		const deployHash = await installWasmFile({
		  chainName: this.chainName,
		  paymentAmount,
		  nodeAddress: this.nodeAddress,
		  keys,
		  pathToContract: wasmPath,
		  runtimeArgs,
		});
	
		if (deployHash !== null) {
		  return deployHash;
		} else {
		  throw Error("Problem with installation");
		}
	}
	public async setContractHash(hash: string) {
		const stateRootHash = await utils.getStateRootHash(this.nodeAddress);
		const contractData = await utils.getContractData(
		this.nodeAddress,
		stateRootHash,
		hash
		);
		const { contractPackageHash, namedKeys } = contractData.Contract!;
		this.contractHash = hash;
		this.contractPackageHash = contractPackageHash.replace(
		"contract-package-wasm",
		""
		);
		const LIST_OF_NAMED_KEYS = [
		'balances',
		'nonces',
		'allowances',
		`${this.contractName}_package_hash`,
		`${this.contractName}_package_hash_wrapped`,
		`${this.contractName}_contract_hash`,
		`${this.contractName}_contract_hash_wrapped`,
		`${this.contractName}_package_access_token`,
		];
		// @ts-ignore
		this.namedKeys = namedKeys.reduce((acc, val) => {
		if (LIST_OF_NAMED_KEYS.includes(val.name)) {
			return { ...acc, [utils.camelCased(val.name)]: val.key };
		}
		return acc;
		}, {});
	}

	public async name() {
		const result = await contractSimpleGetter(
		this.nodeAddress,
		this.contractHash,
		["name"]
		);
		return result.value();
	}

	public async symbol() {
		const result = await contractSimpleGetter(
		this.nodeAddress,
		this.contractHash,
		["symbol"]
		);
		return result.value();
	}

	public async decimal() {
		const result = await contractSimpleGetter(
		this.nodeAddress,
		this.contractHash,
		["decimals"]
		);
		return result.value();
	}

	public async totalSupply() {
		const result = await contractSimpleGetter(
		this.nodeAddress,
		this.contractHash,
		["total_supply"]
		);
		return result.value();
	}

	public async getPairAddress() {
		const result = await contractSimpleGetter(
			this.nodeAddress,
			this.contractHash,
			["get_pair_address"]
		);
		return result.value();
	}

	public async getTotalStaked() {
		const result = await contractSimpleGetter(
			this.nodeAddress,
			this.contractHash,
			["get_total_staked"]
		);
		return result.value();
	}

	public async getLiquidityTransformer() {
		const result = await contractSimpleGetter(
			this.nodeAddress,
			this.contractHash,
			["get_liquidity_transformer"]
		);
		return result.value();
	}

	public async getSyntheticTokenAddress() {
		const result = await contractSimpleGetter(
			this.nodeAddress,
			this.contractHash,
			["get_synthetic_token_address"]
		);
		return result.value();
	}

	public async balanceOf(account: string) {
		try {
		
		const result = await utils.contractDictionaryGetter(
			this.nodeAddress,
			account,
			this.namedKeys.balances
		);
		const maybeValue = result.value().unwrap();
		return maybeValue.value().toString();

		} catch (error) {
		return "0";
		}
		
	}

	public async nonce(accountHash: string) {
		const result = await utils.contractDictionaryGetter(
		this.nodeAddress,
		accountHash,
		this.namedKeys.nonces
		);
		const maybeValue = result.value().unwrap();
		return maybeValue.value().toString();
	}

	public async allowance(owner:string, spender:string) {
		try {
		const _spender = new CLByteArray(
			Uint8Array.from(Buffer.from(spender, "hex"))
		);

		const keyOwner=new CLKey(new CLAccountHash(Uint8Array.from(Buffer.from(owner, "hex"))));
		const keySpender = createRecipientAddress(_spender);
		const finalBytes = concat([CLValueParsers.toBytes(keyOwner).unwrap(), CLValueParsers.toBytes(keySpender).unwrap()]);
		const blaked = blake.blake2b(finalBytes, undefined, 32);
		const encodedBytes = Buffer.from(blaked).toString("hex");

		const result = await utils.contractDictionaryGetter(
			this.nodeAddress,
			encodedBytes,
			this.namedKeys.allowances
		);

		const maybeValue = result.value().unwrap();
		return maybeValue.value().toString();
		} catch (error) {
		return "0";
		}

	}
	
	public async approve(
		keys: Keys.AsymmetricKey,
		spender: string,
		amount: string,
		paymentAmount: string
	) {

		const _spender = new CLByteArray(
				Uint8Array.from(Buffer.from(spender, "hex"))
			);
		const runtimeArgs = RuntimeArgs.fromMap({
		spender: utils.createRecipientAddress(_spender),
		amount: CLValueBuilder.u256(amount)
		});

		const deployHash = await contractCall({
		chainName: this.chainName,
		contractHash: this.contractHash,
		entryPoint: "approve",
		keys,
		nodeAddress: this.nodeAddress,
		paymentAmount,
		runtimeArgs,
		});

		if (deployHash !== null) {
		
		return deployHash;
		} else {
		throw Error("Invalid Deploy");
		}
	}
	public async transfer(
		keys: Keys.AsymmetricKey,
		recipient: RecipientType,
		amount: string,
		paymentAmount: string
	) {

		const runtimeArgs = RuntimeArgs.fromMap({
		recipient: utils.createRecipientAddress(recipient),
		amount: CLValueBuilder.u256(amount)
		});

		const deployHash = await contractCall({
		chainName: this.chainName,
		contractHash: this.contractHash,
		entryPoint: "transfer_Jsclient",
		keys,
		nodeAddress: this.nodeAddress,
		paymentAmount,
		runtimeArgs,
		});

		if (deployHash !== null) {
		
		return deployHash;
		} else {
		throw Error("Invalid Deploy");
		}
	}

	public async transferFrom(
		keys: Keys.AsymmetricKey,
		owner: RecipientType,
		recipient: RecipientType,
		amount: string,
		paymentAmount: string
	) {

		const runtimeArgs = RuntimeArgs.fromMap({
		owner: utils.createRecipientAddress(owner),
		recipient: utils.createRecipientAddress(recipient),
		amount: CLValueBuilder.u256(amount)
		});


		const deployHash = await contractCall({
		chainName: this.chainName,
		contractHash: this.contractHash,
		entryPoint: "transfer_from_Jsclient",
		keys,
		nodeAddress: this.nodeAddress,
		paymentAmount,
		runtimeArgs,
		});

		if (deployHash !== null) {
		
		return deployHash;
		} else {
		throw Error("Invalid Deploy");
		}
	}

	public async mint(
		keys: Keys.AsymmetricKey,
		to: RecipientType,
		amount: string,
		paymentAmount: string
	) {
		
		const runtimeArgs = RuntimeArgs.fromMap({
		to:utils.createRecipientAddress(to),
		amount: CLValueBuilder.u256(amount)
		});

		const deployHash = await contractCall({
		chainName: this.chainName,
		contractHash: this.contractHash,
		entryPoint: "mint",
		keys,
		nodeAddress: this.nodeAddress,
		paymentAmount,
		runtimeArgs,
		});

		if (deployHash !== null) {
		
		return deployHash;
		} else {
		throw Error("Invalid Deploy");
		}
	}

	public async burn(
		keys: Keys.AsymmetricKey,
		from: RecipientType,
		amount: string,
		paymentAmount: string
	) {

		const runtimeArgs = RuntimeArgs.fromMap({
		from: utils.createRecipientAddress(from),
		amount: CLValueBuilder.u256(amount)
		});

		const deployHash = await contractCall({
		chainName: this.chainName,
		contractHash: this.contractHash,
		entryPoint: "burn",
		keys,
		nodeAddress: this.nodeAddress,
		paymentAmount,
		runtimeArgs,
		});

		if (deployHash !== null) {
		
		return deployHash;
		} else {
		throw Error("Invalid Deploy");
		}
	}

	public async permit(
		keys: Keys.AsymmetricKey,
		publicKey: string,
		signature: string,
		owner: RecipientType,
		spender: RecipientType,
		amount: string,
		deadline: string,
		paymentAmount: string
	) {

		const runtimeArgs = RuntimeArgs.fromMap({
		public: CLValueBuilder.string(publicKey),
		signature: CLValueBuilder.string(signature),
		owner: utils.createRecipientAddress(owner),
		spender: utils.createRecipientAddress(spender),
		value: CLValueBuilder.u256(amount),
		deadline: CLValueBuilder.u64(deadline)
		});


		const deployHash = await contractCall({
		chainName: this.chainName,
		contractHash: this.contractHash,
		entryPoint: "permit",
		keys,
		nodeAddress: this.nodeAddress,
		paymentAmount,
		runtimeArgs,
		});

		if (deployHash !== null) {
		
		return deployHash;
		} else {
		throw Error("Invalid Deploy");
		}
	}

	public async setLiquidityTransfomer(
		keys: Keys.AsymmetricKey,
		immutableTransformer: string,
		transformerPurse: string,
		paymentAmount: string
	) {
		const immutable_transformer = new CLByteArray(
			Uint8Array.from(Buffer.from(immutableTransformer, "hex"))
		);
		const transformer_purse = new CLURef(
			decodeBase16(transformerPurse),
			AccessRights.READ_ADD_WRITE
		);
		const runtimeArgs = RuntimeArgs.fromMap({
			immutable_transformer: CLValueBuilder.key(immutable_transformer),
			transformer_purse,
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "set_liquidity_transfomer",
			paymentAmount,
			nodeAddress: this.nodeAddress,
			keys: keys,
			runtimeArgs,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	
	public async renounceKeeper(keys: Keys.AsymmetricKey, paymentAmount: string) {
		const runtimeArgs = RuntimeArgs.fromMap({});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "renounce_keeper",
			paymentAmount,
			nodeAddress: this.nodeAddress,
			keys: keys,
			runtimeArgs,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	
	public async changeKeeper(
		keys: Keys.AsymmetricKey,
		keeper: string,
		paymentAmount: string
	) {
		const _keeper = new CLByteArray(
			Uint8Array.from(Buffer.from(keeper, "hex"))
		);

		const runtimeArgs = RuntimeArgs.fromMap({
			keeper: CLValueBuilder.key(_keeper),
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "change_keeper",
			paymentAmount,
			nodeAddress: this.nodeAddress,
			keys: keys,
			runtimeArgs,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}

	public async mintSupply(
		keys: Keys.AsymmetricKey,
		investorAddress: string,
		amount: string,
		paymentAmount: string
	) {
		const investor_address = new CLByteArray(
			Uint8Array.from(Buffer.from(investorAddress, "hex"))
		);

		const runtimeArgs = RuntimeArgs.fromMap({
			investor_address: CLValueBuilder.key(investor_address),
			amount: CLValueBuilder.u256(amount),
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "mint_supply",
			paymentAmount,
			nodeAddress: this.nodeAddress,
			keys: keys,
			runtimeArgs,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}

	public async extendLtAuction(
		keys: Keys.AsymmetricKey,
		paymentAmount: string
	) {
		const runtimeArgs = RuntimeArgs.fromMap({});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "extend_lt_auction",
			paymentAmount,
			nodeAddress: this.nodeAddress,
			keys: keys,
			runtimeArgs,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async liquidityGuardTrigger(
		keys: Keys.AsymmetricKey,
		paymentAmount: string
	) {
		const runtimeArgs = RuntimeArgs.fromMap({});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "liquidity_guard_trigger",
			paymentAmount,
			nodeAddress: this.nodeAddress,
			keys: keys,
			runtimeArgs,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async manualDailySnapshot(
		keys: Keys.AsymmetricKey,
		paymentAmount: string
	) {
		const runtimeArgs = RuntimeArgs.fromMap({});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "manual_daily_snapshot",
			paymentAmount,
			nodeAddress: this.nodeAddress,
			keys: keys,
			runtimeArgs,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async manualDailySnapshotPoint(
		keys: Keys.AsymmetricKey,
		update_day: string,
		paymentAmount: string
	) {
		const runtimeArgs = RuntimeArgs.fromMap({
			update_day: CLValueBuilder.u64(update_day),
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "manual_daily_snapshot_point",
			paymentAmount,
			nodeAddress: this.nodeAddress,
			keys: keys,
			runtimeArgs,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async referrer_interest(
		keys: Keys.AsymmetricKey,
		referrer_id: string,
		scrape_days: string,
		paymentAmount:string
	) {

		const runtimeArgs = RuntimeArgs.fromMap({
			referrer_id: CLValueBuilder.u256(referrer_id),
			scrape_days: CLValueBuilder.u256(scrape_days),
		});

		const deployHash = await contractCall({
			nodeAddress: this.nodeAddress,
			keys:keys,
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "referrer_interest",
			runtimeArgs,
			paymentAmount,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async referrer_interest_bulk(
		keys: Keys.AsymmetricKey,
		referrer_ids: string,
		scrape_days: string,
		paymentAmount:string
	) {

		const runtimeArgs = RuntimeArgs.fromMap({
			referrer_ids: CLValueBuilder.u256(referrer_ids),
			scrape_days: CLValueBuilder.u256(scrape_days),
		});

		const deployHash = await contractCall({
			nodeAddress: this.nodeAddress,
			keys:keys,
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "referrer_interest_bulk",
			runtimeArgs,
			paymentAmount,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	
	public async createStakeWithCsprJsclient(
		keys: Keys.AsymmetricKey,
		lock_days: string,
		referrer: string,
		amount: string,
		purse: string,
		paymentAmount:string
	) {
		const referrerbytearray = new CLByteArray(Uint8Array.from(Buffer.from(referrer, 'hex')));
		const _purse = new CLURef(
			decodeBase16(purse),
			AccessRights.READ_ADD_WRITE
		);
		const runtimeArgs = RuntimeArgs.fromMap({
			lock_days: CLValueBuilder.u64(lock_days),
			referrer: CLValueBuilder.key(referrerbytearray),
			amount: CLValueBuilder.u256(amount),
			purse: _purse
		});

		const deployHash = await contractCall({
			nodeAddress: this.nodeAddress,
			keys:keys,
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "create_stake_with_cspr_Jsclient",
			runtimeArgs,
			paymentAmount,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}

	public async createStakeWithTokenJsclient(
		keys: Keys.AsymmetricKey,
		token_address: string,
		token_amount: string,
		lock_days: string,
		referrer: string,
		paymentAmount:string
	) {
		const tokenbytearray = new CLByteArray(Uint8Array.from(Buffer.from(token_address, 'hex')));
		const referrerbytearray = new CLByteArray(Uint8Array.from(Buffer.from(referrer, 'hex')));

		const runtimeArgs = RuntimeArgs.fromMap({
			token_address: CLValueBuilder.key(tokenbytearray),
			token_amount: CLValueBuilder.u256(token_amount),
			lock_days: CLValueBuilder.u64(lock_days),
			referrer: CLValueBuilder.key(referrerbytearray)
		});

		const deployHash = await contractCall({
			nodeAddress: this.nodeAddress,
			keys:keys,
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "create_stake_with_token_Jsclient",
			runtimeArgs,
			paymentAmount,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async createStakeJsclient(
		keys: Keys.AsymmetricKey,
		staked_amount: string,
		lock_days: string,
		referrer: string,
		paymentAmount:string
	) {
		
		const _referrer=new CLKey(new CLAccountHash(Uint8Array.from(Buffer.from(referrer, "hex"))));
		const runtimeArgs = RuntimeArgs.fromMap({
			staked_amount: CLValueBuilder.u256(staked_amount),
			lock_days: CLValueBuilder.u64(lock_days),
			referrer: _referrer
		});

		const deployHash = await contractCall({
			nodeAddress: this.nodeAddress,
			keys:keys,
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "create_stake_Jsclient",
			runtimeArgs,
			paymentAmount,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async endStakeJsclient(
		keys: Keys.AsymmetricKey,
		stake_id: string,
		paymentAmount:string
	) {

		const runtimeArgs = RuntimeArgs.fromMap({
			stake_id: CLValueBuilder.u256(stake_id),
		});

		const deployHash = await contractCall({
			nodeAddress: this.nodeAddress,
			keys:keys,
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "end_stake_Jsclient",
			runtimeArgs,
			paymentAmount,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async scrapeInterestJsclient(
		keys: Keys.AsymmetricKey,
		stake_id: string,
		scrape_days: string,
		paymentAmount:string
	) {

		const runtimeArgs = RuntimeArgs.fromMap({
			stake_id: CLValueBuilder.u256(stake_id),
			scrape_days: CLValueBuilder.u64(scrape_days),
		});

		const deployHash = await contractCall({
			nodeAddress: this.nodeAddress,
			keys:keys,
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "scrape_interest_Jsclient",
			runtimeArgs,
			paymentAmount,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async checkReferralsByIdJsclient(
		keys: Keys.AsymmetricKey,
		_referrer: string,
		referral_id: string,
		paymentAmount:string
	) {
		const referrerbytearray = new CLByteArray(Uint8Array.from(Buffer.from(_referrer, 'hex')));
		const runtimeArgs = RuntimeArgs.fromMap({
			referrer: CLValueBuilder.key(referrerbytearray),
			referral_id: CLValueBuilder.u256(referral_id),
		});

		const deployHash = await contractCall({
			nodeAddress: this.nodeAddress,
			keys:keys,
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "check_referrals_by_id_Jsclient",
			runtimeArgs,
			paymentAmount,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async checkMatureStakeJsclient(
		keys: Keys.AsymmetricKey,
		staker: string,
		stake_id: string,
		paymentAmount:string
	) {
		const stakerbytearray = new CLByteArray(Uint8Array.from(Buffer.from(staker, 'hex')));
		const runtimeArgs = RuntimeArgs.fromMap({
			staker: CLValueBuilder.key(stakerbytearray),
			stake_id: CLValueBuilder.u256(stake_id),
		});

		const deployHash = await contractCall({
			nodeAddress: this.nodeAddress,
			keys:keys,
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "check_mature_stake_Jsclient",
			runtimeArgs,
			paymentAmount,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async checkStakeByIdJsclient(
		keys: Keys.AsymmetricKey,
		staker: string,
		stake_id: string,
		paymentAmount:string
	) {
		const stakerbytearray = new CLByteArray(Uint8Array.from(Buffer.from(staker, 'hex')));
		const runtimeArgs = RuntimeArgs.fromMap({
			staker: CLValueBuilder.key(stakerbytearray),
			stake_id: CLValueBuilder.u256(stake_id),
		});

		const deployHash = await contractCall({
			nodeAddress: this.nodeAddress,
			keys:keys,
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "check_stake_by_id_Jsclient",
			runtimeArgs,
			paymentAmount,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async createLiquidityStakeJsclient(
		keys: Keys.AsymmetricKey,
		liquidity_tokens: string,
		paymentAmount:string
	) {
	
		const runtimeArgs = RuntimeArgs.fromMap({
			liquidity_tokens: CLValueBuilder.u256(liquidity_tokens),
		});

		const deployHash = await contractCall({
			nodeAddress: this.nodeAddress,
			keys:keys,
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "create_liquidity_stake_Jsclient",
			runtimeArgs,
			paymentAmount,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async endLiquidityStakeJsclient(
		keys: Keys.AsymmetricKey,
		liquidity_stake_id: string,
		paymentAmount:string
	) {
		const runtimeArgs = RuntimeArgs.fromMap({
			staker: CLValueBuilder.u256(liquidity_stake_id),
		});

		const deployHash = await contractCall({
			nodeAddress: this.nodeAddress,
			keys:keys,
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "end_liquidity_stake_Jsclient",
			runtimeArgs,
			paymentAmount,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async check_liquidity_stake_by_id_Jsclient(
		keys: Keys.AsymmetricKey,
		staker: string,
		liquidity_stake_id: string,
		paymentAmount:string
	) {
		const stakerbytearray = new CLByteArray(Uint8Array.from(Buffer.from(staker, 'hex')));
		const runtimeArgs = RuntimeArgs.fromMap({
			staker: CLValueBuilder.key(stakerbytearray),
			liquidity_stake_id: CLValueBuilder.u256(liquidity_stake_id),
		});

		const deployHash = await contractCall({
			nodeAddress: this.nodeAddress,
			keys:keys,
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "check_liquidity_stake_by_id_Jsclient",
			runtimeArgs,
			paymentAmount,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
}

interface IInstallParams {
	nodeAddress: string;
	keys: Keys.AsymmetricKey;
	chainName: string;
	pathToContract: string;
	runtimeArgs: RuntimeArgs;
	paymentAmount: string;
}

const installWasmFile = async ({
	nodeAddress,
	keys,
	chainName,
	pathToContract,
	runtimeArgs,
	paymentAmount,
}: IInstallParams): Promise<string> => {
	const client = new CasperClient(nodeAddress);

	// Set contract installation deploy (unsigned).
	let deploy = DeployUtil.makeDeploy(
		new DeployUtil.DeployParams(
			CLPublicKey.fromHex(keys.publicKey.toHex()),
			chainName
		),
		DeployUtil.ExecutableDeployItem.newModuleBytes(
			utils.getBinary(pathToContract),
			runtimeArgs
		),
		DeployUtil.standardPayment(paymentAmount)
	);

	// Sign deploy.
	deploy = client.signDeploy(deploy, keys);

	// Dispatch deploy to node.
	return await client.putDeploy(deploy);
};

interface IContractCallParams {
	nodeAddress: string;
	keys: Keys.AsymmetricKey;
	chainName: string;
	entryPoint: string;
	runtimeArgs: RuntimeArgs;
	paymentAmount: string;
	contractHash: string;
}

const contractCall = async ({
	nodeAddress,
	keys,
	chainName,
	contractHash,
	entryPoint,
	runtimeArgs,
	paymentAmount,
}: IContractCallParams) => {
	const client = new CasperClient(nodeAddress);
	const contractHashAsByteArray = utils.contractHashToByteArray(contractHash);

	let deploy = DeployUtil.makeDeploy(
		new DeployUtil.DeployParams(keys.publicKey, chainName),
		DeployUtil.ExecutableDeployItem.newStoredContractByHash(
			contractHashAsByteArray,
			entryPoint,
			runtimeArgs
		),
		DeployUtil.standardPayment(paymentAmount)
	);

	// Sign deploy.
	deploy = client.signDeploy(deploy, keys);

	// Dispatch deploy to node.
	const deployHash = await client.putDeploy(deploy);

	return deployHash;
};

const contractSimpleGetter = async (
	nodeAddress: string,
	contractHash: string,
	key: string[]
) => {
	const stateRootHash = await utils.getStateRootHash(nodeAddress);
	const clValue = await utils.getContractData(
		nodeAddress,
		stateRootHash,
		contractHash,
		key
	);

	if (clValue && clValue.CLValue instanceof CLValue) {
		return clValue.CLValue!;
	} else {
		throw Error("Invalid stored value");
	}
};

export default WISETokenClient;

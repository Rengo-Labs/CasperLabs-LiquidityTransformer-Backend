import { config } from "dotenv";
config();
import { WISETokenClient, utils, constants } from "../src";
const { fetchBlockStateRootHashHelper } = require("../../../utils/casper");
const {
	NODE_ADDRESS,
	EVENT_STREAM_ADDRESS,
	CHAIN_NAME,
} = process.env;

const wise = new WISETokenClient(
	NODE_ADDRESS!,
	CHAIN_NAME!,
	EVENT_STREAM_ADDRESS!
);

export const balanceOf = async (contractHash:string, key:string) => {
  
	console.log(`... Contract Hash: ${contractHash}`);
  
	// We don't need hash- prefix so i'm removing it
	await wise.setContractHash(contractHash);
  
   //balanceof
	let balance = await wise.balanceOf(key);
  
	console.log(`... Balance: ${balance}`);
  
	return balance;
  
  };
export const balanceOfBlock = async (contractHash:string, key:string, block: string) => {
  
	let blockData = await fetchBlockStateRootHashHelper(block);
	console.log("stateRootHash: ",blockData.block.header.state_root_hash);
  
	console.log(`... Contract Hash: ${contractHash}`);
  
	// We don't need hash- prefix so i'm removing it
	await wise.setContractHash(contractHash);
  
	//balanceof
	let balance = await wise.balanceOfBlock(key,blockData.block.header.state_root_hash);
	console.log(`... Balance: ${balance}`);
  
	return balance;
  
};
export const getTotalSupply = async (contractHash:string) => {
  
	// We don't need hash- prefix so i'm removing it
	await wise.setContractHash(contractHash);
  
	 //totalsupply
	 let totalSupply = await wise.totalSupply();
	 console.log(contractHash +` = ... Total supply: ${totalSupply}`);
  
	return totalSupply;
	
};
export const getTotalSupplyBlock = async (contractHash:string,block:string) => {

	let blockData = await fetchBlockStateRootHashHelper(block);
	console.log("stateRootHash: ",blockData.block.header.state_root_hash);

	// We don't need hash- prefix so i'm removing it
	await wise.setContractHash(contractHash);
  
	 //totalsupply
	 let totalSupply = await wise.totalSupplyBlock(blockData.block.header.state_root_hash);
	 console.log(contractHash +` = ... Total supply: ${totalSupply}`);
  
	return totalSupply;
	
};
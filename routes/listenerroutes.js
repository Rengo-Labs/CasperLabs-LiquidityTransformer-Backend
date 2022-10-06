require("dotenv").config();
var express = require("express");
var router = express.Router();
var { request } = require("graphql-request");
var allcontractsDataModel = require("../models/allcontractsData");

function splitdata(data) {
  var temp = data.split("(");
  var result = temp[1].split(")");
  return result[0];
}

router
  .route("/getContractHashAgainstPackageHash")
  .post(async function (req, res, next) {
    try {
      if (!req.body.packageHash) {
        return res.status(400).json({
          success: false,
          message: "There is no packageHash specified in the req body.",
        });
      }

      let packageHash = req.body.packageHash.toLowerCase();
      let contractHash = await allcontractsDataModel.findOne({
        packageHash: packageHash,
      });

      return res.status(200).json({
        success: true,
        message: "Contract Hash has been Succefully found.",
        Data: contractHash,
      });
    } catch (error) {
      console.log("error (try-catch) : " + error);
      return res.status(500).json({
        success: false,
        err: error,
      });
    }
});

async function geteventsdata(eventResult,_deployHash, _timestamp, _block_hash, _eventname, _eventdata){	
  try {

      if (!_deployHash) {
        console.log("There is no deployHash specified in the parameters");
        return false;
      }
      if (!_timestamp) {
        console.log("There is no timestamp specified in the parameters");
        return false;
      }
      if (!_block_hash) {
        console.log("There is no blockHash specified in the parameters");
        return false;
      }
      if (!_eventname) {
        console.log("There is no eventname specified in the parameters");
        return false;
      }
      if (!_eventdata) {
        console.log("There is no eventdata specified in the parameters");
        return false;
      }

      let newData = _eventdata;
      let deployHash = _deployHash;
      let timestamp = (_timestamp).toString();
      let block_hash = _block_hash;
      let eventName = _eventname;
      console.log("... Deployhash: ", deployHash);
      console.log("... Timestamp: ", timestamp);
      console.log("... Block hash: ", block_hash);
      console.log("Event Data: ", newData);

    if (eventName == "refundIssued") {
      console.log(eventName + " Event result: ");

      var refundedTo,amount;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);

        refundedTo = splitdata(newData[2][1]);
        amount = newData[3][1];
      }
      else{
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);

        refundedTo = splitdata(newData[2][1].data);
        amount = newData[3][1].data;
      }

      console.log("refundedTo: ", refundedTo);
      console.log("amount: ", amount);

      console.log("Calling handleRefundIssued mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleRefundIssued( $refundedTo: String!, $amount: String!, $deployHash: String!,$eventObjectId: String!){
                handleRefundIssued( refundedTo: $refundedTo, amount: $amount, deployHash: $deployHash,eventObjectId: $eventObjectId) {
                  result
              }
                        
              }`,
        {
          refundedTo: refundedTo,
          amount: amount,
          deployHash: deployHash,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleRefundIssued Mutation called.");  
      return true;  
    } else if (eventName == "cashBackIssued") {
      console.log(eventName + " Event result: ");

      var totalCashBack, senderAddress, senderValue ,cashBackAmount;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
        console.log(newData[4][0] + " = " + newData[4][1]);
        console.log(newData[5][0] + " = " + newData[5][1]);

        totalCashBack = newData[2][1];
        senderAddress = splitdata(newData[3][1]);
        senderValue = newData[4][1];
        cashBackAmount = newData[5][1];
      }
      else{
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
        console.log(newData[4][0].data + " = " + newData[4][1].data);
        console.log(newData[5][0].data + " = " + newData[5][1].data);

        totalCashBack = newData[2][1].data;
        senderAddress = splitdata(newData[3][1].data);
        senderValue = newData[4][1].data;
        cashBackAmount = newData[5][1].data;
      }
      

      console.log("totalCashBack: ", totalCashBack);
      console.log("senderAddress: ", senderAddress);
      console.log("senderValue: ", senderValue);
      console.log("cashBackAmount: ", cashBackAmount);

      console.log("Calling handleCashBackIssued mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleCashBackIssued( $totalCashBack:String!, $senderAddress: String!, $senderValue: String!,$cashBackAmount: String!, $deployHash: String!,$eventObjectId: String!){
                handleCashBackIssued( totalCashBack:$totalCashBack, senderAddress: $senderAddress, senderValue: $senderValue, cashBackAmount: $cashBackAmount, deployHash: $deployHash,eventObjectId: $eventObjectId) {
                  result
              }
                        
              }`,
        {
          totalCashBack: totalCashBack,
          senderAddress: senderAddress,
          senderValue: senderValue,
          cashBackAmount: cashBackAmount,
          deployHash: deployHash,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleCashBackIssued Mutation called.");  
      return true;   
    } else if (eventName == "give_status") {
      console.log(eventName + " Event result: ");

      var referrerId;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);

        referrerId = splitdata(newData[2][1]);
      }
      else{
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);

        referrerId = splitdata(newData[2][1].data);
      }
     
      console.log("referrerId: ", referrerId);

      console.log("Calling handleGiveStatus mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleGiveStatus( $referrerId: String!,$eventObjectId: String!){
            handleGiveStatus( referrerId: $referrerId,eventObjectId: $eventObjectId) {
                    result
                }
                          
                }`,
        {
          referrerId: referrerId,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleGiveStatus  Mutation called.");  
      return true;    
    } else if (eventName == "uniswapSwapResult") {
      console.log(eventName + " Event result: ");

      var amountTokenA,amountTokenB,liquidity;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
        console.log(newData[4][0] + " = " + newData[4][1]);

        amountTokenA = newData[2][1];
        amountTokenB = newData[3][1];
        liquidity = newData[4][1];
      }
      else{
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
        console.log(newData[4][0].data + " = " + newData[4][1].data);
  
        amountTokenA = newData[2][1].data;
        amountTokenB = newData[3][1].data;
        liquidity = newData[4][1].data;
      }

      console.log("amountTokenA: ", amountTokenA);
      console.log("amountTokenB: ", amountTokenB);
      console.log("liquidity: ", liquidity);

      console.log("Calling handleUniswapSwapedResult mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleUniswapSwapedResult( $amountTokenA:String!,$ amountTokenB: String!, $liquidity: String!,$deployHash: String!,$eventObjectId: String!){
            handleUniswapSwapedResult( amountTokenA:$amountTokenA,  amountTokenB: $ amountTokenB, liquidity: $ liquidity, deployHash: $deployHash,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
        {
          amountTokenA: amountTokenA,
          amountTokenB: amountTokenB,
          liquidity: liquidity,
          deployHash: deployHash,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleUniswapSwapedResult  Mutation called.");  
      return true; 
    } else if (eventName == "uniswap_reserves") {
      console.log(eventName + " Event result: ");

      var reserveA,reserveB,blockTimestampLast;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
        console.log(newData[4][0] + " = " + newData[4][1]);
  
        reserveA = newData[2][1];
        reserveB = newData[3][1];
        blockTimestampLast = newData[4][1];
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
        console.log(newData[4][0].data + " = " + newData[4][1].data);
  
        reserveA = newData[2][1].data;
        reserveB = newData[3][1].data;
        blockTimestampLast = newData[4][1].data;
      }
      

      console.log("reserveA: ", reserveA);
      console.log("reserveB: ", reserveB);
      console.log("blockTimestampLast: ", blockTimestampLast);

      console.log("Calling handleUniswapReserves mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleUniswapReserves( $reserveA:String!,$ reserveB: String!, $blockTimestampLast: String!,$eventObjectId: String!){
            handleUniswapReserves( reserveA:$reserveA,  reserveB: $ reserveB, blockTimestampLast: $ blockTimestampLast,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
        {
          reserveA: reserveA,
          reserveB: reserveB,
          blockTimestampLast: blockTimestampLast,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleUniswapReserves  Mutation called.");  
      return true; 
    } else if (eventName == "liquidity_guard_status") {
      console.log(eventName + " Event result: ");

      var liquidityGuardStatusString;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
  
        liquidityGuardStatusString = newData[2][1];
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
  
        liquidityGuardStatusString = newData[2][1].data;
      }

      console.log("liquidityGuardStatusString: ", liquidityGuardStatusString);

      let liquidityGuardStatus = false;
      if (liquidityGuardStatusString == "true") {
        liquidityGuardStatus = true;
      } else {
        liquidityGuardStatus = false;
      }
      console.log("Calling handleLiquidityGuardStatus mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleLiquidityGuardStatus( $liquidityGuardStatus:Boolean!,$eventObjectId: String!){
            handleLiquidityGuardStatus( liquidityGuardStatus:$liquidityGuardStatus,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
        {
          liquidityGuardStatus: liquidityGuardStatus,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleLiquidityGuardStatus  Mutation called.");  
      return true; 
    } else if (eventName == "referral_collected") {
      console.log(eventName + " Event result: ");

      var staker,stakerId,referrer,referrerId,rewardAmount;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
        console.log(newData[4][0] + " = " + newData[4][1]);
        console.log(newData[5][0] + " = " + newData[5][1]);
        console.log(newData[6][0] + " = " + newData[6][1]);
  
        staker = splitdata(newData[2][1]);
        stakerId = newData[3][1];
        referrer = splitdata(newData[4][1]);
        referrerId = newData[5][1];
        rewardAmount = newData[6][1];
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
        console.log(newData[4][0].data + " = " + newData[4][1].data);
        console.log(newData[5][0].data + " = " + newData[5][1].data);
        console.log(newData[6][0].data + " = " + newData[6][1].data);
  
        staker = splitdata(newData[2][1].data);
        stakerId = newData[3][1].data;
        referrer = splitdata(newData[4][1].data);
        referrerId = newData[5][1].data;
        rewardAmount = newData[6][1].data;
      }

      console.log("staker: ", staker);
      console.log("stakerId: ", stakerId);
      console.log("referrer: ", referrer);
      console.log("referrerId: ", referrerId);
      console.log("rewardAmount: ", rewardAmount);

      console.log("handleReferralCollected  Mutation don't exists.");  
      eventResult.status="completed";
      await eventResult.save();
      return true;

    } else if (eventName == "stake_start") {
      console.log(eventName + " Event result: ");

      var stakerAddress,referralAddress,referralShares,
      stakeID,stakedAmount,stakesShares,startDay,lockDays,
      daiEquivalent;

      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
        console.log(newData[4][0] + " = " + newData[4][1]);
        console.log(newData[5][0] + " = " + newData[5][1]);
        console.log(newData[6][0] + " = " + newData[6][1]);
        console.log(newData[7][0] + " = " + newData[7][1]);
        console.log(newData[8][0] + " = " + newData[8][1]);
        console.log(newData[9][0] + " = " + newData[9][1]);
        console.log(newData[10][0] + " = " + newData[10][1]);

        stakerAddress = splitdata(newData[2][1]);
        referralAddress = splitdata(newData[3][1]);
        referralShares = newData[4][1];
        stakeID = splitdata(newData[5][1]);
        stakedAmount = newData[6][1];
        stakesShares = newData[7][1];
        startDay = newData[8][1];
        lockDays = newData[9][1];
        daiEquivalent = newData[10][1];
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
        console.log(newData[4][0].data + " = " + newData[4][1].data);
        console.log(newData[5][0].data + " = " + newData[5][1].data);
        console.log(newData[6][0].data + " = " + newData[6][1].data);
        console.log(newData[7][0].data + " = " + newData[7][1].data);
        console.log(newData[8][0].data + " = " + newData[8][1].data);
        console.log(newData[9][0].data + " = " + newData[9][1].data);
        console.log(newData[10][0].data + " = " + newData[10][1].data);
        
        stakerAddress = splitdata(newData[2][1].data);
        referralAddress = splitdata(newData[3][1].data);
        referralShares = newData[4][1].data;
        stakeID = splitdata(newData[5][1].data);
        stakedAmount = newData[6][1].data;
        stakesShares = newData[7][1].data;
        startDay = newData[8][1].data;
        lockDays = newData[9][1].data;
        daiEquivalent = newData[10][1].data;
      }

      console.log("stakerAddress: ", stakerAddress);
      console.log("referralAddress: ", referralAddress);
      console.log("referralShares: ", referralShares);
      console.log("stakeID: ", stakeID);
      console.log("stakedAmount: ", stakedAmount);
      console.log("stakesShares: ", stakesShares);
      console.log("startDay: ", startDay);
      console.log("lockDays: ", lockDays);
      console.log("daiEquivalent: ", daiEquivalent);

      console.log("Calling handleStakeStart mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleStakeStart( 
          $stakerAddress: String!,
          $referralAddress: String!,
          $referralShares: String!,
          $stakeID: String!,
          $stakedAmount: String!,
          $stakesShares: String!,
          $startDay: String!,
          $lockDays: String!,
          $daiEquivalent: String!,
          $eventObjectId: String!
          ){
          handleStakeStart( 
            stakerAddress:$stakerAddress,
            referralAddress:$referralAddress,
            referralShares: $referralShares,
            stakeID:$stakeID,
            stakedAmount:$stakedAmount,
            stakesShares:$stakesShares,
            startDay:$startDay,
            lockDays:$lockDays,
            daiEquivalent:$daiEquivalent,
            eventObjectId: $eventObjectId
            ) {
                  result
              }
                        
              }`,
        {
          stakerAddress: stakerAddress,
          referralAddress: referralAddress,
          referralShares: referralShares,
          stakeID: stakeID,
          stakedAmount: stakedAmount,
          stakesShares: stakesShares,
          startDay: startDay,
          lockDays: lockDays,
          daiEquivalent: daiEquivalent,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleStakeStart  Mutation called.");  
      return true; 
    } else if (eventName == "stake_end") {
      console.log(eventName + " Event result: ");

      var stakeID,stakerAddress,referralAddress,stakedAmount,
      stakesShares,referralShares,rewardAmount,closeDay,
      penaltyAmount;

      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
        console.log(newData[4][0] + " = " + newData[4][1]);
        console.log(newData[5][0] + " = " + newData[5][1]);
        console.log(newData[6][0] + " = " + newData[6][1]);
        console.log(newData[7][0] + " = " + newData[7][1]);
        console.log(newData[8][0] + " = " + newData[8][1]);
        console.log(newData[9][0] + " = " + newData[9][1]);
        console.log(newData[10][0] + " = " + newData[10][1]);

        stakeID = splitdata(newData[2][1]);
        stakerAddress = splitdata(newData[3][1]);
        referralAddress = splitdata(newData[4][1]);
        stakedAmount = newData[5][1];
        stakesShares = newData[6][1];
        referralShares = newData[7][1];
        rewardAmount = newData[8][1];
        closeDay = newData[9][1];
        penaltyAmount = newData[10][1];
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
        console.log(newData[4][0].data + " = " + newData[4][1].data);
        console.log(newData[5][0].data + " = " + newData[5][1].data);
        console.log(newData[6][0].data + " = " + newData[6][1].data);
        console.log(newData[7][0].data + " = " + newData[7][1].data);
        console.log(newData[8][0].data + " = " + newData[8][1].data);
        console.log(newData[9][0].data + " = " + newData[9][1].data);
        console.log(newData[10][0].data + " = " + newData[10][1].data);
        
        stakeID = splitdata(newData[2][1].data);
        stakerAddress = splitdata(newData[3][1].data);
        referralAddress = splitdata(newData[4][1].data);
        stakedAmount = newData[5][1].data;
        stakesShares = newData[6][1].data;
        referralShares = newData[7][1].data;
        rewardAmount = newData[8][1].data;
        closeDay = newData[9][1].data;
        penaltyAmount = newData[10][1].data;
      }
      
      console.log("stakeID: ", stakeID);
      console.log("stakerAddress: ", stakerAddress);
      console.log("referralAddress: ", referralAddress);
      console.log("stakedAmount: ", stakedAmount);
      console.log("stakesShares: ", stakesShares);
      console.log("referralShares: ", referralShares);
      console.log("rewardAmount: ", rewardAmount);
      console.log("closeDay: ", closeDay);
      console.log("penaltyAmount: ", penaltyAmount);

      console.log("Calling handleStakeEnd mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleStakeEnd( $stakeID: String!, $closeDay: String!, $rewardAmount: String!,$penaltyAmount:String!,$eventObjectId: String!){
          handleStakeEnd( stakeID: $stakeID, closeDay: $closeDay, rewardAmount: $rewardAmount,penaltyAmount:$penaltyAmount,eventObjectId: $eventObjectId) {
                  result
              }
                        
              }`,
        {
          stakeID: stakeID,
          closeDay: closeDay,
          rewardAmount: rewardAmount,
          penaltyAmount: penaltyAmount,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleStakeEnd  Mutation called.");  
      return true;   
    } else if (eventName == "interest_scraped") {
      console.log(eventName + " Event result: ");

      var stakeID,stakerAddress,scrapeAmount,scrapeDay,
      stakersPenalty,referrerPenalty,currentWiseDay;

      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
        console.log(newData[4][0] + " = " + newData[4][1]);
        console.log(newData[5][0] + " = " + newData[5][1]);
        console.log(newData[6][0] + " = " + newData[6][1]);
        console.log(newData[7][0] + " = " + newData[7][1]);
        console.log(newData[8][0] + " = " + newData[8][1]);
  
        stakeID = splitdata(newData[2][1]);
        stakerAddress = splitdata(newData[3][1]);
        scrapeAmount = newData[4][1];
        scrapeDay = newData[5][1];
        stakersPenalty = newData[6][1];
        referrerPenalty = newData[7][1];
        currentWiseDay = newData[8][1];
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
        console.log(newData[4][0].data + " = " + newData[4][1].data);
        console.log(newData[5][0].data + " = " + newData[5][1].data);
        console.log(newData[6][0].data + " = " + newData[6][1].data);
        console.log(newData[7][0].data + " = " + newData[7][1].data);
        console.log(newData[8][0].data + " = " + newData[8][1].data);
  
        stakeID = splitdata(newData[2][1].data);
        stakerAddress = splitdata(newData[3][1].data);
        scrapeAmount = newData[4][1].data;
        scrapeDay = newData[5][1].data;
        stakersPenalty = newData[6][1].data;
        referrerPenalty = newData[7][1].data;
        currentWiseDay = newData[8][1].data;
      }
      

      console.log("stakeID: ", stakeID);
      console.log("stakerAddress: ", stakerAddress);
      console.log("scrapeAmount: ", scrapeAmount);
      console.log("scrapeDay: ", scrapeDay);
      console.log("stakersPenalty: ", stakersPenalty);
      console.log("referrerPenalty: ", referrerPenalty);
      console.log("currentWiseDay: ", currentWiseDay);

      console.log("Calling handleInterestScraped mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleInterestScraped(  
            $stakeID:String!,
            $scrapeDay:String!,
            $scrapeAmount:String!,
            $stakersPenalty:String!,
            $referrerPenalty:String!,
            $eventObjectId: String!
            ){
            handleInterestScraped( 
              stakeID:$stakeID,
              scrapeDay:$scrapeDay,
              scrapeAmount:$scrapeAmount,
              stakersPenalty:$stakersPenalty,
              referrerPenalty:$referrerPenalty,
              eventObjectId: $eventObjectId
              ) {
                    result
                }
                          
                }`,
        {
          stakeID: stakeID,
          scrapeDay: scrapeDay,
          scrapeAmount: scrapeAmount,
          stakersPenalty: stakersPenalty,
          referrerPenalty: referrerPenalty,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleInterestScraped  Mutation called.");  
      return true;      
    } else if (eventName == "new_globals") {
      console.log(eventName + " Event result: ");

      var totalShares,totalStaked,shareRate,
      referrerShares,currentWiseDay;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
        console.log(newData[4][0] + " = " + newData[4][1]);
        console.log(newData[5][0] + " = " + newData[5][1]);
        console.log(newData[6][0] + " = " + newData[6][1]);
  
        totalShares = newData[2][1];
        totalStaked = newData[3][1];
        shareRate = newData[4][1];
        referrerShares = newData[5][1];
        currentWiseDay = newData[6][1];
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
        console.log(newData[4][0].data + " = " + newData[4][1].data);
        console.log(newData[5][0].data + " = " + newData[5][1].data);
        console.log(newData[6][0].data + " = " + newData[6][1].data);
  
        totalShares = newData[2][1].data;
        totalStaked = newData[3][1].data;
        shareRate = newData[4][1].data;
        referrerShares = newData[5][1].data;
        currentWiseDay = newData[6][1].data;
      }
      
      let wiseToken=await allcontractsDataModel.findOne({packageHash:process.env.WISETOKEN_PACKAGE_HASH});
      let uniswapPair=await allcontractsDataModel.findOne({packageHash:process.env.PAIR_PACKAGE_HASH});
      var wiseAddress = wiseToken.contractHash;
      var UNISWAP_PAIR = uniswapPair.contractHash;

      console.log("totalShares: ", totalShares);
      console.log("totalStaked: ", totalStaked);
      console.log("shareRate: ", shareRate);
      console.log("referrerShares: ", referrerShares);
      console.log("currentWiseDay: ", currentWiseDay);
      console.log("wiseAddress: ", wiseAddress);
      console.log("UNISWAP_PAIR: ", UNISWAP_PAIR);

      console.log("Calling handleNewGlobals mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleNewGlobals( 
            $totalShares: String!, 
            $totalStaked: String!, 
            $shareRate: String!, 
            $referrerShares: String!, 
            $currentWiseDay: String!, 
            $wiseAddress: String!, 
            $UNISWAP_PAIR: String!,
            $eventObjectId: String!)
            {
            handleNewGlobals( 
              totalShares: $totalShares, 
              totalStaked: $totalStaked, 
              shareRate: $shareRate,
              referrerShares: $referrerShares,
              currentWiseDay: $currentWiseDay,
              wiseAddress: $wiseAddress,
              UNISWAP_PAIR: $UNISWAP_PAIR,
              eventObjectId: $eventObjectId) {
                    result
                }
                          
                }`,
        {
          totalShares: totalShares,
          totalStaked: totalStaked,
          shareRate: shareRate,
          referrerShares: referrerShares,
          currentWiseDay: currentWiseDay,
          wiseAddress: wiseAddress,
          UNISWAP_PAIR: UNISWAP_PAIR,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleNewGlobals  Mutation called.");  
      return true;   
    } else if (eventName == "new_share_price") {
      console.log(eventName + " Event result: ");

      var newSharePrice,oldSharePrice,currentWiseDay;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
        console.log(newData[4][0] + " = " + newData[4][1]);
  
        newSharePrice = newData[2][1];
        oldSharePrice = newData[3][1];
        currentWiseDay = newData[4][1];
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
        console.log(newData[4][0].data + " = " + newData[4][1].data);
  
        newSharePrice = newData[2][1].data;
        oldSharePrice = newData[3][1].data;
        currentWiseDay = newData[4][1].data;
      }
      
      console.log("newSharePrice: ", newSharePrice);
      console.log("oldSharePrice: ", oldSharePrice);
      console.log("currentWiseDay: ", currentWiseDay);

      console.log("Calling handleNewSharePrice mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleNewSharePrice( $newSharePrice: String!, $oldSharePrice: String!,$eventObjectId: String!){
            handleNewSharePrice( newSharePrice: $newSharePrice, oldSharePrice: $oldSharePrice,eventObjectId: $eventObjectId) {
                    result
                }
                          
                }`,
        {
          newSharePrice: newSharePrice,
          oldSharePrice: oldSharePrice,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleNewSharePrice  Mutation called.");  
      return true;    
    } else if (eventName == "referral_added") {
      console.log(eventName + " Event result: ");

      var from,referral,referee,amount;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
        console.log(newData[4][0] + " = " + newData[4][1]);
        console.log(newData[5][0] + " = " + newData[5][1]);
  
        from = splitdata(newData[2][1]);
        referral = splitdata(newData[3][1]);
        referee = splitdata(newData[4][1]);
        amount = newData[5][1];
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
        console.log(newData[4][0].data + " = " + newData[4][1].data);
        console.log(newData[5][0].data + " = " + newData[5][1].data);
  
        from = splitdata(newData[2][1].data);
        referral = splitdata(newData[3][1].data);
        referee = splitdata(newData[4][1].data);
        amount = newData[5][1].data;
      }

      console.log("from: ", from);
      console.log("referral: ", referral);
      console.log("referee: ", referee);
      console.log("amount: ", amount);

      console.log("Calling handleReferralAdded mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleReferralAdded( 
            $deployHash:String!,
            $blockHash:String!,
            $timestamp:String!,
            $from:String!,
            $referral:String!,
            $referee:String!,
            $amount:String!,
            $eventObjectId: String!
            ){
            handleReferralAdded( 
              deployHash:$deployHash,
              blockHash:$blockHash,
              timestamp:$timestamp,
              from:$from,
              referral:$referral,
              referee:$referee,
              amount:$amount,
              eventObjectId: $eventObjectId
              ) {
                    result
                }
                          
                }`,
        {
          deployHash: deployHash,
          blockHash: block_hash,
          timestamp: timestamp,
          from: from,
          referral: referral,
          referee: referee,
          amount: amount,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleReferralAdded  Mutation called.");  
      return true;   
    } else if (eventName == "wiseReservation") {
      console.log(eventName + " Event result: ");

      var from,amount,tokens,currentWiseDay,investmentMode;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
        console.log(newData[4][0] + " = " + newData[4][1]);
        console.log(newData[5][0] + " = " + newData[5][1]);
        console.log(newData[6][0] + " = " + newData[6][1]);

        from = splitdata(newData[5][1]);
        amount = newData[3][1];
        tokens = newData[6][1];
        currentWiseDay = newData[1][1];
        investmentMode = newData[4][1];

      }
      else{
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
        console.log(newData[4][0].data + " = " + newData[4][1].data);
        console.log(newData[5][0].data + " = " + newData[5][1].data);
        console.log(newData[6][0].data + " = " + newData[6][1].data);

        from = splitdata(newData[5][1].data);
        amount = newData[3][1].data;
        tokens = newData[6][1].data;
        currentWiseDay = newData[1][1].data;
        investmentMode = newData[4][1].data;
      }

      console.log("from: ", from);
      console.log("amount: ", amount);
      console.log("tokens: ", tokens);
      console.log("currentWiseDay: ", currentWiseDay);
      console.log("investmentMode: ", investmentMode);

      console.log("Calling handleWiseReservation mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleWiseReservation( 
            $deployHash:String!,
            $blockHash:String!,
            $timestamp:String!,
            $from:String!,
            $amount:String!,
            $tokens:String!,
            $currentWiseDay:String!,
            $investmentMode:String!,
            $eventObjectId: String!
            ){
            handleWiseReservation( 
            deployHash:$deployHash,
            blockHash:$blockHash,
            timestamp:$timestamp,
            from:$from,
            amount:$amount,
            tokens:$tokens,
            currentWiseDay:$currentWiseDay,
            investmentMode:$investmentMode,
            eventObjectId: $eventObjectId
            ) {
                    result
                }
                          
                }`,
        {
          deployHash: deployHash,
          blockHash: block_hash,
          timestamp: timestamp,
          from: from,
          amount: amount,
          tokens: tokens,
          currentWiseDay: currentWiseDay,
          investmentMode: investmentMode,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleWiseReservation  Mutation called.");  
      return true;   
    } else if (eventName == "depositedLiquidity") {
      console.log(eventName + " Event result: ");

      var depositAmount,transformerAddress;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
  
        depositAmount = newData[2][1];
        transformerAddress = splitdata(newData[3][1]);
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
  
        depositAmount = newData[2][1].data;
        transformerAddress = splitdata(newData[3][1].data);
      }
      
      console.log("depositAmount: ", depositAmount);
      console.log("transformerAddress: ", transformerAddress);

      console.log("Calling handleDepositedLiquidity mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleDepositedLiquidity( $user: String!, $amount: String!, $deployHash: String!,$eventObjectId: String!){
            handleDepositedLiquidity( user: $user, amount: $amount, deployHash: $deployHash,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
        {
          user: transformerAddress,
          amount: depositAmount,
          deployHash: deployHash,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleDepositedLiquidity  Mutation called.");  
      return true;   
    } else if (eventName == "withdrawal") {
      console.log(eventName + " Event result: ");

      var fromAddress,tokenAmount;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
  
        fromAddress = splitdata(newData[2][1]);
        tokenAmount = newData[3][1];
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
  
        fromAddress = splitdata(newData[2][1].data);
        tokenAmount = newData[3][1].data;
      }

      console.log("fromAddress: ", fromAddress);
      console.log("tokenAmount: ", tokenAmount);

      console.log("Calling handleWithdrawal mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleWithdrawal( $user: String!, $amount: String!, $deployHash: String!,$eventObjectId: String!){
                handleWithdrawal( user: $user, amount: $amount, deployHash: $deployHash,eventObjectId: $eventObjectId) {
                  result
              }
                        
              }`,
        {
          user: fromAddress,
          amount: tokenAmount,
          deployHash: deployHash,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleWithdrawal  Mutation called.");  
      return true;  
    } else if (eventName == "formedLiquidityv") {
      console.log(eventName + " Event result: ");

      var coverAmount,amountTokenA,
      amountTokenB,liquidity;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
        console.log(newData[4][0] + " = " + newData[4][1]);
        console.log(newData[5][0] + " = " + newData[5][1]);
  
        coverAmount = newData[2][1];
        amountTokenA = newData[3][1];
        amountTokenB = newData[4][1];
        liquidity = newData[5][1];
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
        console.log(newData[4][0].data + " = " + newData[4][1].data);
        console.log(newData[5][0].data + " = " + newData[5][1].data);
  
        coverAmount = newData[2][1].data;
        amountTokenA = newData[3][1].data;
        amountTokenB = newData[4][1].data;
        liquidity = newData[5][1].data;
      }
      
      console.log("coverAmount: ", coverAmount);
      console.log("amountTokenA: ", amountTokenA);
      console.log("amountTokenB: ", amountTokenB);
      console.log("liquidity: ", liquidity);

      console.log("Calling handleFormedLiquidity mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleFormedLiquidity( $ coverAmount:String! ,$amountTokenA:String!,$ amountTokenB: String!, $liquidity: String!,$deployHash: String!,$eventObjectId: String!){
            handleFormedLiquidity( coverAmount:$coverAmount, amountTokenA:$amountTokenA,  amountTokenB: $ amountTokenB, liquidity: $ liquidity, deployHash: $deployHash,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
        {
          coverAmount: coverAmount,
          amountTokenA: amountTokenA,
          amountTokenB: amountTokenB,
          liquidity: liquidity,
          deployHash: deployHash,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleFormedLiquidity  Mutation called.");  
      return true; 
    } else if (eventName == "LiquidityRemoved") {
      console.log(eventName + " Event result: ");

      var amountWcspr,amountScspr;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
  
        amountWcspr = newData[2][1];
        amountScspr = newData[3][1];
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
  
        amountWcspr = newData[2][1].data;
        amountScspr = newData[3][1].data;
      }

      console.log("amountWcspr: ", amountWcspr);
      console.log("amountScspr: ", amountScspr);

      console.log("Calling handleLiquidityRemoved mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleLiquidityRemoved( $amountWcspr: String!, $amountScspr: String!,$eventObjectId: String!){
                handleLiquidityRemoved( amountWcspr: $amountWcspr, amountScspr: $amountScspr,eventObjectId: $eventObjectId) {
                  result
              }
                        
              }`,
        {
          amountWcspr: amountWcspr,
          amountScspr: amountScspr,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleLiquidityRemoved  Mutation called.");  
      return true; 
    } else if (eventName == "SendFeesToMaster") {
      console.log(eventName + " Event result: ");

      var amountWcspr,masterAddress;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
  
        amountWcspr = newData[2][1];
        masterAddress = splitdata(newData[3][1]);
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
  
        amountWcspr = newData[2][1].data;
        masterAddress = splitdata(newData[3][1].data);
      }
      

      console.log("amountWcspr: ", amountWcspr);
      console.log("masterAddress: ", masterAddress);

      console.log("Calling handleMasterRecord mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleMasterRecord( $masterAddress: String!, $amount: String!, $source: String!,$eventObjectId: String!){
            handleMasterRecord( masterAddress: $masterAddress, amount: $amount, source: $source,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
        {
          masterAddress: masterAddress,
          amount: amountWcspr,
          source: eventName,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleMasterRecord  Mutation called.");  
      return true; 
    } else if (eventName == "LiquidityAdded") {
      console.log(eventName + " Event result: ");

      var amountWcspr,amountScspr,liquidity;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
        console.log(newData[4][0] + " = " + newData[4][1]);
  
        amountWcspr = newData[2][1];
        amountScspr = newData[3][1];
        liquidity = newData[4][1];
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
        console.log(newData[4][0].data + " = " + newData[4][1].data);
  
        amountWcspr = newData[2][1].data;
        amountScspr = newData[3][1].data;
        liquidity = newData[4][1].data;
      }
      

      console.log("amountWcspr: ", amountWcspr);
      console.log("amountScspr: ", amountScspr);
      console.log("liquidity: ", liquidity);

      console.log("Calling handleLiquidityAdded mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleLiquidityAdded( $amountWcspr: String!, $amountScspr: String!, $liquidity: String!,$eventObjectId: String!){
                handleLiquidityAdded( amountWcspr: $amountWcspr, amountScspr: $amountScspr, liquidity: $liquidity,eventObjectId: $eventObjectId) {
                  result
              }
                        
              }`,
        {
          amountWcspr: amountWcspr,
          amountScspr: amountScspr,
          liquidity: liquidity,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleLiquidityAdded  Mutation called.");  
      return true; 
    } else if (eventName == "MasterProfit") {
      console.log(eventName + " Event result: ");

      var amountWcspr,masterAddress;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
  
        amountWcspr = newData[2][1];
        masterAddress = splitdata(newData[3][1]);
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
  
        amountWcspr = newData[2][1].data;
        masterAddress = splitdata(newData[3][1].data);
      }

      console.log("amountWcspr: ", amountWcspr);
      console.log("masterAddress: ", masterAddress);

      console.log("Calling handleMasterRecord mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleMasterRecord( $masterAddress: String!, $amount: String!, $source: String!,$eventObjectId: String!){
            handleMasterRecord( masterAddress: $masterAddress, amount: $amount, source: $source,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
        {
          masterAddress: masterAddress,
          amount: amountWcspr,
          source: eventName,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleMasterRecord  Mutation called.");  
      return true; 
    } else if (eventName == "SendArbitrageProfitToMaster") {
      console.log(eventName + " Event result: ");

      var amountWcspr,masterAddress;
      if(newData[0][0].data == undefined)
      {
        console.log(newData[0][0] + " = " + newData[0][1]);
        console.log(newData[1][0] + " = " + newData[1][1]);
        console.log(newData[2][0] + " = " + newData[2][1]);
        console.log(newData[3][0] + " = " + newData[3][1]);
  
        amountWcspr = newData[2][1];
        masterAddress = splitdata(newData[3][1]);
      }
      else
      {
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
  
        amountWcspr = newData[2][1].data;
        masterAddress = splitdata(newData[3][1].data);
      }

      console.log("amountWcspr: ", amountWcspr);
      console.log("masterAddress: ", masterAddress);

      console.log("Calling handleMasterRecord mutation...");
      await request(
        process.env.GRAPHQL,
        `mutation handleMasterRecord( $masterAddress: String!, $amount: String!, $source: String!,$eventObjectId: String!){
            handleMasterRecord( masterAddress: $masterAddress, amount: $amount, source: $source,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
        {
          masterAddress: masterAddress,
          amount: amountWcspr,
          source: eventName,
          eventObjectId:eventResult._id
        }
      )
      console.log("handleMasterRecord  Mutation called.");  
      return true; 
    } else {
      console.log("There is no mutation for the event: ",eventName);
      eventResult.status="completed";
      await eventResult.save();
      return true;
    }
  } catch (error) {
    console.log("error (try-catch) : " + error);
    return false;
    
  }
}

module.exports = {router,geteventsdata};
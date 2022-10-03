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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);

      var refundedTo = splitdata(newData[2][1].data);
      var amount = newData[3][1].data;

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);
      console.log(newData[5][0].data + " = " + newData[5][1].data);

      var totalCashBack = newData[2][1].data;
      var senderAddress = splitdata(newData[3][1].data);
      var senderValue = newData[4][1].data;
      var cashBackAmount = newData[5][1].data;

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);

      var referrerId = splitdata(newData[2][1].data);

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);

      var amountTokenA = newData[2][1].data;
      var amountTokenB = newData[3][1].data;
      var liquidity = newData[4][1].data;

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);

      var reserveA = newData[2][1].data;
      var reserveB = newData[3][1].data;
      var blockTimestampLast = newData[4][1].data;

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);

      var liquidityGuardStatusString = newData[2][1].data;

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);
      console.log(newData[5][0].data + " = " + newData[5][1].data);
      console.log(newData[6][0].data + " = " + newData[6][1].data);

      var staker = splitdata(newData[2][1].data);
      var stakerId = newData[3][1].data;
      var referrer = splitdata(newData[4][1].data);
      var referrerId = newData[5][1].data;
      var rewardAmount = newData[6][1].data;

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

      var stakerAddress = splitdata(newData[2][1].data);
      var referralAddress = splitdata(newData[3][1].data);
      var referralShares = newData[4][1].data;
      var stakeID = splitdata(newData[5][1].data);
      var stakedAmount = newData[6][1].data;
      var stakesShares = newData[7][1].data;
      var startDay = newData[8][1].data;
      var lockDays = newData[9][1].data;
      var daiEquivalent = newData[10][1].data;

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

      var stakeID = splitdata(newData[2][1].data);
      var stakerAddress = splitdata(newData[3][1].data);
      var referralAddress = splitdata(newData[4][1].data);
      var stakedAmount = newData[5][1].data;
      var stakesShares = newData[6][1].data;
      var referralShares = newData[7][1].data;
      var rewardAmount = newData[8][1].data;
      var closeDay = newData[9][1].data;
      var penaltyAmount = newData[10][1].data;

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);
      console.log(newData[5][0].data + " = " + newData[5][1].data);
      console.log(newData[6][0].data + " = " + newData[6][1].data);
      console.log(newData[7][0].data + " = " + newData[7][1].data);
      console.log(newData[8][0].data + " = " + newData[8][1].data);

      var stakeID = splitdata(newData[2][1].data);
      var stakerAddress = splitdata(newData[3][1].data);
      var scrapeAmount = newData[4][1].data;
      var scrapeDay = newData[5][1].data;
      var stakersPenalty = newData[6][1].data;
      var referrerPenalty = newData[7][1].data;
      var currentWiseDay = newData[8][1].data;

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);
      console.log(newData[5][0].data + " = " + newData[5][1].data);
      console.log(newData[6][0].data + " = " + newData[6][1].data);

      var totalShares = newData[2][1].data;
      var totalStaked = newData[3][1].data;
      var shareRate = newData[4][1].data;
      var referrerShares = newData[5][1].data;
      var currentWiseDay = newData[6][1].data;
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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);

      var newSharePrice = newData[2][1].data;
      var oldSharePrice = newData[3][1].data;
      var currentWiseDay = newData[4][1].data;

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);
      console.log(newData[5][0].data + " = " + newData[5][1].data);

      var from = splitdata(newData[2][1].data);
      var referral = splitdata(newData[3][1].data);
      var referee = splitdata(newData[4][1].data);
      var amount = newData[5][1].data;

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);

      var from = splitdata(newData[5][1].data);
      var amount = newData[3][1].data;
      var tokens = newData[6][1].data;

      var currentWiseDay = newData[1][1].data;
      var investmentMode = newData[4][1].data;

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);

      var depositAmount = newData[2][1].data;
      var transformerAddress = splitdata(newData[3][1].data);

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);

      var fromAddress = splitdata(newData[2][1].data);
      var tokenAmount = newData[3][1].data;

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);
      console.log(newData[5][0].data + " = " + newData[5][1].data);

      var coverAmount = newData[2][1].data;
      var amountTokenA = newData[3][1].data;
      var amountTokenB = newData[4][1].data;
      var liquidity = newData[5][1].data;

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);

      var amountWcspr = newData[2][1].data;
      var amountScspr = newData[3][1].data;

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);

      var amountWcspr = newData[2][1].data;
      var masterAddress = splitdata(newData[3][1].data);

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);
      console.log(newData[4][0].data + " = " + newData[4][1].data);

      var amountWcspr = newData[2][1].data;
      var amountScspr = newData[3][1].data;
      var liquidity = newData[4][1].data;

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);

      var amountWcspr = newData[2][1].data;
      var masterAddress = splitdata(newData[3][1].data);

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
      console.log(newData[0][0].data + " = " + newData[0][1].data);
      console.log(newData[1][0].data + " = " + newData[1][1].data);
      console.log(newData[2][0].data + " = " + newData[2][1].data);
      console.log(newData[3][0].data + " = " + newData[3][1].data);

      var amountWcspr = newData[2][1].data;
      var masterAddress = splitdata(newData[3][1].data);

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
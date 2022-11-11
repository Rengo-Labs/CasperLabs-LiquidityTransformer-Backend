require("dotenv").config();
var { request } = require("graphql-request");
var eventObjectId="636e3915ad4c29d36f726593";

async function RefundIssued(refundedTo, amount, deployHash) {
  console.log("Calling handleRefundIssued mutation...");
  let response = await request(
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
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function CashBackIssued(
  totalCashBack,
  senderAddress,
  senderValue,
  cashBackAmount,
  deployHash
) {
  console.log("Calling handleCashBackIssued mutation...");
  let response = await request(
    process.env.GRAPHQL,
    `mutation handleCashBackIssued( $totalCashBack:String!,$senderAddress: String!, $senderValue: String!,$cashBackAmount: String!, $deployHash: String!,$eventObjectId: String!){
            handleCashBackIssued( totalCashBack:$totalCashBack, senderAddress: $senderAddress, senderValue: $senderValue, cashBackAmount: $ cashBackAmount, deployHash: $deployHash,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
    {
      totalCashBack: totalCashBack,
      senderAddress: senderAddress,
      senderValue: senderValue,
      cashBackAmount: cashBackAmount,
      deployHash: deployHash,
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function UniswapSwapedResult(
  amountTokenA,
  amountTokenB,
  liquidity,
  deployHash
) {
  console.log("Calling handleUniswapSwapedResult mutation...");
  let response = await request(
    process.env.GRAPHQL,
    `mutation handleUniswapSwapedResult( $amountTokenA:String!,$ amountTokenB: String!, $liquidity: String!,$deployHash: String!,$eventObjectId: String!){
            handleUniswapSwapedResult( amountTokenA:$amountTokenA,  amountTokenB: $ amountTokenB, liquidity: $liquidity, deployHash: $deployHash,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
    {
      amountTokenA: amountTokenA,
      amountTokenB: amountTokenB,
      liquidity: liquidity,
      deployHash: deployHash,
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function UniswapReserves(reserveA, reserveB, blockTimestampLast) {
  console.log("Calling handleUniswapReserves mutation...");
  let response = await request(
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
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function LiquidityGuardStatus(liquidityGuardStatusString) {
  let liquidityGuardStatus = false;
  if (liquidityGuardStatusString == "true") {
    liquidityGuardStatus = true;
  } else {
    liquidityGuardStatus = false;
  }
  console.log("Calling handleLiquidityGuardStatus mutation...");
  let response = await request(
    process.env.GRAPHQL,
    `mutation handleLiquidityGuardStatus( $liquidityGuardStatus:Boolean!,$eventObjectId: String!){
            handleLiquidityGuardStatus( liquidityGuardStatus:$liquidityGuardStatus,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
    {
      liquidityGuardStatus: liquidityGuardStatus,
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}
async function GiveStatus(referrerId) {
  console.log("Calling handleGiveStatus mutation...");
  let response = await request(
    process.env.GRAPHQL,
    `mutation handleGiveStatus( $referrerId: String!,$eventObjectId: String!){
      handleGiveStatus( referrerId: $referrerId,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
    {
      referrerId: referrerId,
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function StakeStart(
  stakerAddress,
  referralAddress,
  referralShares,
  stakeID,
  stakedAmount,
  stakesShares,
  startDay,
  lockDays,
  daiEquivalent
) {
  console.log("Calling handleStakeStart mutation...");
  let response = await request(
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
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function StakeEnd(stakeID, closeDay, rewardAmount, penaltyAmount) {
  console.log("Calling handleStakeEnd mutation...");
  let response = await request(
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
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function InterestScraped(
  stakeID,
  scrapeDay,
  scrapeAmount,
  stakersPenalty,
  referrerPenalty
) {
  console.log("Calling handleInterestScraped mutation...");
  let response = await request(
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
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function NewGlobals(
  totalShares,
  totalStaked,
  shareRate,
  referrerShares,
  currentWiseDay,
  wiseAddress,
  UNISWAP_PAIR
) {
  console.log("Calling handleNewGlobals mutation...");
  let response = await request(
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
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function NewSharePrice(newSharePrice, oldSharePrice) {
  console.log("Calling handleNewSharePrice mutation...");
  let response = await request(
    process.env.GRAPHQL,
    `mutation handleNewSharePrice( $newSharePrice: String!, $oldSharePrice: String!,$eventObjectId: String!){
      handleNewSharePrice( newSharePrice: $newSharePrice, oldSharePrice: $oldSharePrice,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
    {
      newSharePrice: newSharePrice,
      oldSharePrice: oldSharePrice,
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function ReferralAdded(
  deployHash,
  blockHash,
  timestamp,
  from,
  referral,
  referee,
  amount
) {
  console.log("Calling handleReferralAdded mutation...");
  let response = await request(
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
      blockHash: blockHash,
      timestamp: timestamp,
      from: from,
      referral: referral,
      referee: referee,
      amount: amount,
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function WiseReservation(
  deployHash,
  blockHash,
  timestamp,
  from,
  amount,
  tokens,
  currentWiseDay,
  investmentMode
) {
  console.log("Calling handleWiseReservation mutation...");
  let response = await request(
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
      blockHash: blockHash,
      timestamp: timestamp,
      from: from,
      amount: amount,
      tokens: tokens,
      currentWiseDay: currentWiseDay,
      investmentMode: investmentMode,
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function DepositedLiquidity(user, amount, deployHash) {
  console.log("Calling handleDepositedLiquidity mutation...");
  let response = await request(
    process.env.GRAPHQL,
    `mutation handleDepositedLiquidity( $user: String!, $amount: String!, $deployHash: String!,$eventObjectId: String!){
            handleDepositedLiquidity( user: $user, amount: $amount, deployHash: $deployHash,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
    {
      user: user,
      amount: amount,
      deployHash: deployHash,
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function Withdrawal(user, amount, deployHash) {
  console.log("Calling handleWithdrawal mutation...");
  let response = await request(
    process.env.GRAPHQL,
    `mutation handleWithdrawal( $user: String!, $amount: String!, $deployHash: String!,$eventObjectId: String!){
            handleWithdrawal( user: $user, amount: $amount, deployHash: $deployHash,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
    {
      user: user,
      amount: amount,
      deployHash: deployHash,
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function FormedLiquidity(
  coverAmount,
  amountTokenA,
  amountTokenB,
  liquidity,
  deployHash
) {
  console.log("Calling handleFormedLiquidity mutation...");
  let response = await request(
    process.env.GRAPHQL,
    `mutation handleFormedLiquidity( $ coverAmount:String! ,$amountTokenA:String!,$ amountTokenB: String!, $liquidity: String!,$deployHash: String!,$eventObjectId: String!){
            handleFormedLiquidity( coverAmount:$coverAmount, amountTokenA:$amountTokenA,  amountTokenB: $amountTokenB, liquidity: $liquidity, deployHash: $deployHash,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
    {
      coverAmount: coverAmount,
      amountTokenA: amountTokenA,
      amountTokenB: amountTokenB,
      liquidity: liquidity,
      deployHash: deployHash,
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function LiquidityAdded(amountWcspr, amountScspr, liquidity) {
  console.log("Calling handleLiquidityAdded mutation...");
  let response = await request(
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
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function LiquidityRemoved(amountWcspr, amountScspr, liquidity) {
  console.log("Calling handleLiquidityRemoved mutation...");
  let response = await request(
    process.env.GRAPHQL,
    `mutation handleLiquidityRemoved( $amountWcspr: String!, $amountScspr: String!,$eventObjectId: String!){
            handleLiquidityRemoved( amountWcspr: $amountWcspr, amountScspr: $amountScspr,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
    {
      amountWcspr: amountWcspr,
      amountScspr: amountScspr,
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function MasterRecord(masterAddress, amount, source) {
  console.log("Calling handleMasterRecord mutation...");
  let response = await request(
    process.env.GRAPHQL,
    `mutation handleMasterRecord( $masterAddress: String!, $amount: String!, $source: String!,$eventObjectId: String!){
            handleMasterRecord( masterAddress: $masterAddress, amount: $amount, source: $source,eventObjectId: $eventObjectId) {
              result
          }
                    
          }`,
    {
      masterAddress: masterAddress,
      amount: amount,
      source: source,
      eventObjectId:eventObjectId
    }
  );
  console.log(response);
}

async function startTests() {
  // await DepositedLiquidity("123", "10000000000", "123");
  // await Withdrawal("123", "10000000000", "123");
  // await FormedLiquidity(
  //   "10000000000",
  //   "10000000000",
  //   "1000000000",
  //   "1000000000000",
  //   "123"
  // );
  // await LiquidityAdded("1000000000", "10000000000", "10000000000");
  // await LiquidityRemoved("1000000000", "10000000000",);
  // await MasterRecord("123", "10000000000", "profit");
  // await UniswapSwapedResult(
  //   "10000000000",
  //   "100000000000",
  //   "10000000000000",
  //   "123"
  // );
  // await UniswapReserves("10000000000", "1000000000", "1000000000000");
  // await LiquidityGuardStatus("true");
  // await GiveStatus("123");
  // await StakeStart(
  //   "24a56544c522eca7fba93fb7a6cef83e086706fd87b2f344f5c3dad3603d11f1",
  //   "282fabb87a057d991937770223de98ae86f6e652a050825aa196dfd4f480029e",
  //   "115500000000000001155000",
  //   "[49020, 28301, 19313, 50701, 60343, 43970, 40891, 23772, 62182, 34752, 60015, 62783, 33387, 61153, 14013, 18915]",
  //   "115500000000000",
  //   "1270500001155000",
  //   "21",
  //   "730",
  //   "866"
  // );
  //await StakeEnd("[21280, 56574, 17098, 26506, 26873, 49251, 54159, 36489, 34562, 63189, 19464, 46488, 22553, 57389, 17143, 40034]", "16", "0", "0");
  await InterestScraped(
    "[33568, 52368, 9568, 40138, 51706, 37378, 49105, 21352, 61428, 18453, 7522, 4263, 57549, 32239, 59170, 43955]",
    "17",
    "0",
    "0",
    "0"
  );
  // await NewGlobals(
  //   "1270500001155000",
  //   "115500000000000",
  //   "100000000000000000",
  //   "115500000000000001155000",
  //   "0",
  //   "11ac763d5e81e95403e32a0648c90da75a9d8e1e5d908a609b805420711d318b",
  //   "24a4e46fd600eea1f057aeb7f3bf70a4468b5ec3c3098c8037b6952a8ec57e28"
  // );
  // await NewSharePrice("10000000000000", "100000000000");

  // await WiseReservation(
  //   "1d21f5d80f5417d128dafb4862476041fb5e8f244f8bbf1cfcf457f53603aaee",
  //   "ab17e4cf75c59b7a14bc2acb55da5912e8566dccc68add64fc4dea3318dd2765",
  //   "1668055888000",
  //   "99f85a87138de56f93ed63d09a6d5ccccaf4b093b0ac829c47fee9d95ea8499d",
  //   "200000000000",
  //   "264000000000000",
  //   "15",
  //   "1"
  // );

  // await RefundIssued("123", "10000000000", "123");
  // await CashBackIssued(
  //   "100000000000000000",
  //   "123",
  //   "10000000000",
  //   "10000000000",
  //   "123"
  // );
  //await ReferralAdded("123", "123", "123", "123", "123", "123", "10000000000");
}

//startTests();

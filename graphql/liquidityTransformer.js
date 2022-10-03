require("dotenv").config();
var mongoose = require('mongoose');
const {
  getOrCreateGlobal,
  createUser,
  ZERO,
  ONE,
  csprVal,
  transactionOptions
} = require("./shared");
const { GraphQLString } = require("graphql");

const User = require("../models/user");
const Reservation = require("../models/reservation");
const UserReservationDay = require("../models/userReservationDay");
const GlobalReservationDay = require("../models/globalReservationDay");
const GlobalReservationDaySnapshot = require("../models/globalReservationDaySnapshot");
const ReservationReferral = require("../models/reservationReferral");
const Transaction = require("../models/transaction");
const UniswapSwapResult = require("../models/uniswapSwapResult");
const DepositedLiquidity = require("../models/depositedLiquidity");
const Withdrawal = require("../models/withdrawal");
const ScsprLiquidity = require("../models/scsprLiquidity");
const FormedLiquidity = require("../models/formedLiquidity");
const MasterRecord = require("../models/MasterRecord");
const Response = require("../models/response");
let eventsData = require("../models/eventsData");
var bigdecimal = require("bigdecimal");

const { responseType } = require("./types/response");

let CM_REFERRER_THRESHOLD = csprVal(50);

let NORMAL_SUPPLY = csprVal(5000000);
let MAX_SUPPLY = NORMAL_SUPPLY + NORMAL_SUPPLY;
let MIN_SUPPLY_1 = csprVal(4500000);
let MIN_SUPPLY_2 = csprVal(4000000);
let MIN_SUPPLY_3 = csprVal(3500000);
let MIN_SUPPLY_4 = csprVal(3000000);
let MIN_SUPPLY_5 = csprVal(2500000);
let MIN_SUPPLY_6 = csprVal(1);

function getMinSupply(day) {
  let dayVal = day / new bigdecimal.BigDecimal(1000000000);
  switch (dayVal) {
    case new bigdecimal.BigDecimal(8):
    case new bigdecimal.BigDecimal(10):
      return MIN_SUPPLY_1;
    case new bigdecimal.BigDecimal(14):
    case new bigdecimal.BigDecimal(16):
    case new bigdecimal.BigDecimal(17):
      return MIN_SUPPLY_2;
    case new bigdecimal.BigDecimal(21):
    case new bigdecimal.BigDecimal(23):
    case new bigdecimal.BigDecimal(25):
      return MIN_SUPPLY_3;
    case new bigdecimal.BigDecimal(29):
    case new bigdecimal.BigDecimal(31):
      return MIN_SUPPLY_4;
    case new bigdecimal.BigDecimal(35):
    case new bigdecimal.BigDecimal(36):
    case new bigdecimal.BigDecimal(38):
      return MIN_SUPPLY_5;
    case new bigdecimal.BigDecimal(12):
    case new bigdecimal.BigDecimal(19):
    case new bigdecimal.BigDecimal(26):
    case new bigdecimal.BigDecimal(33):
    case new bigdecimal.BigDecimal(40):
    case new bigdecimal.BigDecimal(42):
    case new bigdecimal.BigDecimal(44):
    case new bigdecimal.BigDecimal(46):
    case new bigdecimal.BigDecimal(47):
    case new bigdecimal.BigDecimal(48):
      return MIN_SUPPLY_6;
    default:
      return NORMAL_SUPPLY;
  }
}

async function upsertTransaction(
  txdeployhash,
  blocknumber,
  blocktimestamp,
  txfrom
) {
  let transaction = await Transaction.findOne({ id: txdeployhash });
  if (transaction == null) {
    transaction = new Transaction({
      id: txdeployhash,
      blockNumber: blocknumber,
      timestamp: blocktimestamp,
      sender: txfrom,
      referral: null,
    });
  }
  return transaction;
}

const handleReferralAdded = {
  type: responseType,
  description: "Handle Referral Added",
  args: {
    deployHash: { type: GraphQLString },
    blockHash: { type: GraphQLString },
    timestamp: { type: GraphQLString },
    from: { type: GraphQLString },
    referral: { type: GraphQLString },
    referee: { type: GraphQLString },
    amount: { type: GraphQLString },
    eventObjectId: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      let global = await getOrCreateGlobal();

      let transaction = await upsertTransaction(
        args.deployHash,
        args.blockHash,
        args.timestamp,
        args.from
      );

      let referrerID = args.referral;
      let referrer = await User.findOne({ id: referrerID });
      if (referrer == null) {
        referrer = await createUser(referrerID);
        global.userCount = (new bigdecimal.BigDecimal(global.userCount).add(new bigdecimal.BigDecimal(ONE))).toString();
      }
      // TODO refactor more == and maybe other operators
      if (referrer.reservationReferralCount == ZERO) {
        global.reservationReferrerCount = (
          new bigdecimal.BigDecimal(global.reservationReferrerCount).add(new bigdecimal.BigDecimal(ONE))
        ).toString();
      }

      let refereeID = args.referee;
      let referee = await User.findOne({ id: refereeID });
      if (referee == null) {
        referee = await createUser(refereeID);
        global.userCount = (new bigdecimal.BigDecimal(global.userCount).add(new bigdecimal.BigDecimal(ONE))).toString();
      }

      let reservedEffectiveEth =
        (new bigdecimal.BigDecimal(args.amount).multiply(new bigdecimal.BigDecimal(11))).divide(new bigdecimal.BigDecimal(10));
      referee.reservationActualWei = (
        new bigdecimal.BigDecimal(referee.reservationActualWei).add(
        new bigdecimal.BigDecimal(args.amount)).subtract(
        reservedEffectiveEth)
      ).toString();
      global.reservationActualWei = (
        new bigdecimal.BigDecimal(global.reservationActualWei).add(
        new bigdecimal.BigDecimal(args.amount)).subtract(
        reservedEffectiveEth)
      ).toString();

      let referralID = args.deployHash;
      let referral = new ReservationReferral({
        id: referralID,
        transaction: transaction.id,
        timestamp: transaction.timestamp,
        referrer: referrer.id,
        referee: referee.id,
        actualWei: args.amount,
      });

      let wasBelowCm = false;
      if (
        new bigdecimal.BigDecimal(referrer.reservationReferralActualWei).compareTo(CM_REFERRER_THRESHOLD) == -1
      ) {
        wasBelowCm = true;
      } else {
        wasBelowCm = false;
      }

      referrer.reservationReferralActualWei = (
        new bigdecimal.BigDecimal(referrer.reservationReferralActualWei).add(
        new bigdecimal.BigDecimal(referral.actualWei))
      ).toString();
      referrer.reservationReferralCount = (
        new bigdecimal.BigDecimal(referrer.reservationReferralCount).add(new bigdecimal.BigDecimal(ONE))
      ).toString();
      if (
        wasBelowCm &&
        (new bigdecimal.BigDecimal(referrer.reservationReferralActualWei).compareTo(CM_REFERRER_THRESHOLD) == 1 
        || new bigdecimal.BigDecimal(referrer.reservationReferralActualWei).compareTo(CM_REFERRER_THRESHOLD) == 0)
        && referrer.cmStatus === false
      ) {
        referrer.cmStatus = true;
        referrer.cmStatusInLaunch = true;
        global.cmStatusCount = (
          new bigdecimal.BigDecimal(global.cmStatusCount).add(new bigdecimal.BigDecimal(ONE))
        ).toString();
        global.cmStatusInLaunchCount = (
          new bigdecimal.BigDecimal(global.cmStatusInLaunchCount).add(new bigdecimal.BigDecimal(ONE))
        ).toString();
      }
      transaction.referral = referral.id;

      let resList = [];
      let txHash = args.deployHash;
      for (let i = 1; i <= 50; i++) {
        let resID = txHash + "-" + (i * 1000000000).toString();
        let reservation = await Reservation.findOne({ id: resID });
        if (reservation != null) {
          resList.push(reservation);
          // TODO populate reservation.referral and save?  Too costly?
        }
      }
      let nRes = new bigdecimal.BigDecimal(resList.length);
      let dayActualWei = new bigdecimal.BigDecimal(referral.actualWei).divide(nRes);
      let remainder = new bigdecimal.BigDecimal(referral.actualWei) % (nRes);
      for (let i = 0; i < resList.length; i++) {
        let actualWei = i === 0 ? dayActualWei + remainder : dayActualWei;

        let res = resList[i];
        res.actualWei = actualWei.toString();
        //await res.save();

        let uResDay = await UserReservationDay.findOne({
          id: res.user + "-" + res.investmentMode,
        });
        uResDay.actualWei = (
          new bigdecimal.BigDecimal(uResDay.actualWei).add(
          new bigdecimal.BigDecimal(res.actualWei)).subtract(
          new bigdecimal.BigDecimal(res.effectiveWei))
        ).toString();
        //await uResDay.save();

        let gResDay = await GlobalReservationDay.findOne({
          id: res.investmentMode,
        });
        gResDay.actualWei = (
          new bigdecimal.BigDecimal(gResDay.actualWei).add(
          new bigdecimal.BigDecimal(res.actualWei)).subtract(
          new bigdecimal.BigDecimal(res.effectiveWei))
        ).toString();
        //await gResDay.save();

        let gResDaySnapshot = new GlobalReservationDaySnapshot({
          id: res.investmentMode + "-" + args.timestamp,
          actualWei: gResDay.actualWei,
        });
        //await GlobalReservationDaySnapshot.create(gResDaySnapshot);
      }

      // updating mutation status
      let eventDataResult = await eventsData.findOne({
        _id: args.eventObjectId,
      });
      eventDataResult.status = "completed";
  
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
          // create new response
          response = new Response({
            id: "1",
          });
      }
      response.result = true;
      // Save changes in the database using a transaction
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await global.save({ session });
          await transaction.save({ session });
          await referrer.save({ session });
          await referee.save({ session });
          await referral.save({ session });
          await eventDataResult.save({ session });
          await response.save({ session });

        }, transactionOptions);

        return response;
      } catch (error) {
        throw new Error(error);
      } finally {
        // Ending the session
        await session.endSession();
      }
    } catch (error) {
      throw new Error(error);
    }
  },
};
const handleWiseReservation = {
  type: responseType,
  description: "Handle Wise Reservation",
  args: {
    deployHash: { type: GraphQLString },
    blockHash: { type: GraphQLString },
    timestamp: { type: GraphQLString },
    from: { type: GraphQLString },
    amount: { type: GraphQLString },
    tokens: { type: GraphQLString },
    currentWiseDay: { type: GraphQLString },
    investmentMode: { type: GraphQLString },
    eventObjectId: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      let global = await getOrCreateGlobal();
      global.reservationCount = (
        new bigdecimal.BigDecimal(global.reservationCount).add(new bigdecimal.BigDecimal(ONE))
      ).toString();
      global.currentWiseDay = args.currentWiseDay;

      let transaction = await upsertTransaction(
        args.deployHash,
        args.blockHash,
        args.timestamp,
        args.from
      );

      let userID = args.from;
      let user = await User.findOne({ id: userID });
      if (user == null) {
        user = await createUser(userID);
        global.userCount = (new bigdecimal.BigDecimal(global.userCount).add(new bigdecimal.BigDecimal(ONE))).toString();
      }
      if (user.reservationCount == ZERO) {
        global.reserverCount = (
          new bigdecimal.BigDecimal(global.reserverCount).add(new bigdecimal.BigDecimal(ONE))
        ).toString();
      }

      let reservationID = args.deployHash + "-" + args.investmentMode;
      let reservation = new Reservation({
        id: reservationID,
        transaction: transaction.id,
        timestamp: transaction.timestamp,
        user: user.id,
        investmentMode: args.investmentMode,
        effectiveWei: args.amount,
        actualWei: args.amount,
        scsprContributed: args.amount,
        transferTokens: args.amount,
        currentWiseDay: args.currentWiseDay,
      });

      user.reservationCount = (
        new bigdecimal.BigDecimal(user.reservationCount).add(new bigdecimal.BigDecimal(ONE))
      ).toString();
      user.reservationEffectiveWei = (
        new bigdecimal.BigDecimal(user.reservationEffectiveWei).add(new bigdecimal.BigDecimal(reservation.effectiveWei))
      ).toString();
      user.reservationActualWei = (
        new bigdecimal.BigDecimal(user.reservationActualWei).add(new bigdecimal.BigDecimal(reservation.effectiveWei))
      ).toString();

      user.scsprContributed = (
        new bigdecimal.BigDecimal(user.scsprContributed).add(new bigdecimal.BigDecimal(args.amount))
      ).toString();
      user.transferTokens = (
        new bigdecimal.BigDecimal(user.transferTokens).add(new bigdecimal.BigDecimal(args.tokens))
      ).toString();

      global.reservationEffectiveWei = (
        new bigdecimal.BigDecimal(global.reservationEffectiveWei) .add(
        new bigdecimal.BigDecimal(reservation.effectiveWei))
      ).toString();
      global.reservationActualWei = (
        new bigdecimal.BigDecimal(global.reservationActualWei).add(new bigdecimal.BigDecimal(reservation.effectiveWei))
      ).toString();

      global.totalScsprContributed = (
        new bigdecimal.BigDecimal(global.totalScsprContributed).add(new bigdecimal.BigDecimal(args.amount))
      ).toString();
      global.totalTransferTokens = (
        new bigdecimal.BigDecimal(global.totalTransferTokens).add(new bigdecimal.BigDecimal(args.tokens))
      ).toString();

      // let gResDayID = reservation.investmentMode;
      // let gResDay = await GlobalReservationDay.findOne({ id: gResDayID });
      // if (gResDay == null) {
      //   gResDay = new GlobalReservationDay({
      //     id: gResDayID,
      //     investmentMode: reservation.investmentMode,
      //     minSupply: getMinSupply(new bigdecimal.BigDecimal(reservation.investmentMode)).toString(),
      //     maxSupply: (
      //       MAX_SUPPLY - getMinSupply(new bigdecimal.BigDecimal(reservation.investmentMode))
      //     ).toString(),
      //     effectiveWei: ZERO,
      //     actualWei: ZERO,
      //     reservationCount: ZERO,
      //     userCount: ZERO,
      //   });
      //   await GlobalReservationDay.create(gResDay);
      // }
      // gResDay.effectiveWei = (
      //   new bigdecimal.BigDecimal(gResDay.effectiveWei).add( new bigdecimal.BigDecimal(reservation.effectiveWei))
      // ).toString();
      // gResDay.actualWei = (
      //   new bigdecimal.BigDecimal(gResDay.actualWei).add(new bigdecimal.BigDecimal(reservation.effectiveWei))
      // ).toString();
      // gResDay.reservationCount = (
      //   new bigdecimal.BigDecimal(gResDay.reservationCount).add(new bigdecimal.BigDecimal(ONE))
      // ).toString();

      // let gResDaySnapshotID = reservation.investmentMode + "-" + args.timestamp;
      // let gResDaySnapshot = new GlobalReservationDaySnapshot({
      //   id: gResDaySnapshotID,
      //   timestamp: args.timestamp,
      //   investmentMode: gResDay.investmentMode,
      //   effectiveWei: gResDay.effectiveWei,
      //   actualWei: gResDay.actualWei,
      //   reservationCount: gResDay.reservationCount,
      // });
      // await GlobalReservationDaySnapshot.create(gResDaySnapshot);

      // let uResDayID = userID + "-" + reservation.investmentMode;
      // let uResDay = await UserReservationDay.findOne({ id: uResDayID });
      // if (uResDay == null) {
      //   uResDay = new UserReservationDay({
      //     id: uResDayID,
      //     user: user.id,
      //     investmentMode: reservation.investmentMode,
      //     effectiveWei: ZERO,
      //     actualWei: ZERO,
      //     reservationCount: ZERO,
      //   });
      //   await UserReservationDay.create(uResDay);
      //   gResDay.userCount = (
      //     new bigdecimal.BigDecimal(gResDay.userCount).add(new bigdecimal.BigDecimal(ONE))
      //   ).toString();
      //   user.reservationDayCount = (
      //     new bigdecimal.BigDecimal(user.reservationDayCount).add(new bigdecimal.BigDecimal(ONE))
      //   ).toString();
      // }
      // uResDay.effectiveWei = (
      //   new bigdecimal.BigDecimal(uResDay.effectiveWei).add(new bigdecimal.BigDecimal(reservation.effectiveWei))
      // ).toString();
      // uResDay.actualWei = (
      //   new bigdecimal.BigDecimal(uResDay.actualWei).add(new bigdecimal.BigDecimal(reservation.effectiveWei))
      // ).toString();
      // uResDay.reservationCount = (
      //   new bigdecimal.BigDecimal(uResDay.reservationCount).add(new bigdecimal.BigDecimal(ONE))
      // ).toString();

      // await uResDay.save();
      // await gResDay.save();

      // gResDaySnapshot.userCount = gResDay.userCount;
      // await gResDaySnapshot.save();

      // updating mutation status
      let eventDataResult = await eventsData.findOne({
        _id: args.eventObjectId,
      });
      eventDataResult.status = "completed";
  
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
          // create new response
          response = new Response({
            id: "1",
          });
      }
      response.result = true;
      // Save changes in the database using a transaction
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await global.save({ session });
          await transaction.save({ session });
          await user.save({ session });
          await reservation.save({ session });
          await eventDataResult.save({ session });
          await response.save({ session });

        }, transactionOptions);

        return response;
      } catch (error) {
        throw new Error(error);
      } finally {
        // Ending the session
        await session.endSession();
      }
    } catch (error) {
      throw new Error(error);
    }
  },
};

const handleRefundIssued = {
  type: responseType,
  description: "Handle Refund Issued",
  args: {
    refundedTo: { type: GraphQLString },
    amount: { type: GraphQLString },
    deployHash: { type: GraphQLString },
    eventObjectId: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      let userID = args.refundedTo;
      let user = await createUser(userID);
      user.gasRefunded = args.amount;
      user.refundTransaction = args.deployHash;

      // updating mutation status
      let eventDataResult = await eventsData.findOne({
        _id: args.eventObjectId,
      });
      eventDataResult.status = "completed";
  
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
          // create new response
          response = new Response({
            id: "1",
          });
      }
      response.result = true;
      // Save changes in the database using a transaction
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await user.save({ session });
          await eventDataResult.save({ session });
          await response.save({ session });

        }, transactionOptions);

        return response;
      } catch (error) {
        throw new Error(error);
      } finally {
        // Ending the session
        await session.endSession();
      }
    } catch (error) {
      throw new Error(error);
    }
  },
};

const handleCashBackIssued = {
  type: responseType,
  description: "Handle CashBackIssued",
  args: {
    totalCashBack: { type: GraphQLString },
    senderAddress: { type: GraphQLString },
    senderValue: { type: GraphQLString },
    cashBackAmount: { type: GraphQLString },
    deployHash: { type: GraphQLString },
    eventObjectId: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      let global = await getOrCreateGlobal();
      global.totalCashBack = args.totalCashBack;

      let userID = args.senderAddress;
      let user = await createUser(userID);
      user.cashBackAmount = args.cashBackAmount;
      user.senderValue = args.senderValue;
      user.cashBackTransaction = args.deployHash;

      // updating mutation status
      let eventDataResult = await eventsData.findOne({
        _id: args.eventObjectId,
      });
      eventDataResult.status = "completed";
  
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
          // create new response
          response = new Response({
            id: "1",
          });
      }
      response.result = true;
      // Save changes in the database using a transaction
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await global.save({ session });
          await user.save({ session });
          await eventDataResult.save({ session });
          await response.save({ session });

        }, transactionOptions);

        return response;
      } catch (error) {
        throw new Error(error);
      } finally {
        // Ending the session
        await session.endSession();
      }
    } catch (error) {
      throw new Error(error);
    }
  },
};

const handleUniswapSwapedResult = {
  type: responseType,
  description: "Handle UniswapSwapedResult",
  args: {
    amountTokenA: { type: GraphQLString },
    amountTokenB: { type: GraphQLString },
    liquidity: { type: GraphQLString },
    deployHash: { type: GraphQLString },
    eventObjectId: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      let global = await getOrCreateGlobal();
      global.uniswapSwaped = true;

      let flag=0;
      let uniswapswapresult = await UniswapSwapResult.findOne({
        id:
          process.env.WISETOKEN_PACKAGE_HASH +
          " - " +
          process.env.SYNTHETIC_CSPR_PACKAGE +
          " - " +
          process.env.PAIR_PACKAGE_HASH,
      });
       if (uniswapswapresult == null) {
        uniswapswapresult = new UniswapSwapResult({
          id:
            process.env.WISETOKEN_PACKAGE_HASH +
            " - " +
            process.env.SYNTHETIC_CSPR_PACKAGE +
            " - " +
            process.env.PAIR_PACKAGE_HASH,
          tokenA: process.env.WISETOKEN_PACKAGE_HASH,
          tokenB: process.env.SYNTHETIC_CSPR_PACKAGE,
          amountTokenA: args.amountTokenA,
          amountTokenB: args.amountTokenB,
          liquidity: args.liquidity,
          pair: process.env.PAIR_PACKAGE_HASH,
          to: "hash-0000000000000000000000000000000000000000000000000000000000000000",
        });
      } else {
        flag=1;
        console.log("can not add UniswapSwapResult Twice...");
      }

      // updating mutation status
      let eventDataResult = await eventsData.findOne({
        _id: args.eventObjectId,
      });
      eventDataResult.status = "completed";
  
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
          // create new response
          response = new Response({
            id: "1",
          });
      }
      response.result = true;
      // Save changes in the database using a transaction
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await global.save({ session });
          if(flag == 0)
          {
            await uniswapswapresult.save({ session });
          }
          await eventDataResult.save({ session });
          await response.save({ session });

        }, transactionOptions);

        return response;
      } catch (error) {
        throw new Error(error);
      } finally {
        // Ending the session
        await session.endSession();
      }
    } catch (error) {
      throw new Error(error);
    }
  },
};

const handleDepositedLiquidity = {
  type: responseType,
  description: "Handle DepositedLiquidity",
  args: {
    user: { type: GraphQLString },
    amount: { type: GraphQLString },
    deployHash: { type: GraphQLString },
    eventObjectId: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      let depositedLiquidity = new DepositedLiquidity({
        user: args.user,
        amount: args.amount,
        deployHash: args.deployHash,
      });

      let scsprliquidityresult = await ScsprLiquidity.findOne({
        user: args.user,
      });
      if (scsprliquidityresult == null) {
        scsprliquidityresult = new ScsprLiquidity({
          user: args.user,
          amount: args.amount,
        });
      } else {
        scsprliquidityresult.amount = (
          new bigdecimal.BigDecimal(scsprliquidityresult.amount).add(new bigdecimal.BigDecimal(args.amount))
        ).toString();
      }

      // updating mutation status
      let eventDataResult = await eventsData.findOne({
        _id: args.eventObjectId,
      });
      eventDataResult.status = "completed";
  
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
          // create new response
          response = new Response({
            id: "1",
          });
      }
      response.result = true;
      // Save changes in the database using a transaction
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await depositedLiquidity.save({ session });
          await scsprliquidityresult.save({ session });
          await eventDataResult.save({ session });
          await response.save({ session });

        }, transactionOptions);

        return response;
      } catch (error) {
        throw new Error(error);
      } finally {
        // Ending the session
        await session.endSession();
      }
    } catch (error) {
      throw new Error(error);
    }
  },
};

const handleWithdrawal = {
  type: responseType,
  description: "Handle Withdrawal",
  args: {
    user: { type: GraphQLString },
    amount: { type: GraphQLString },
    deployHash: { type: GraphQLString },
    eventObjectId: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      let withdrawal = new Withdrawal({
        user: args.user,
        amount: args.amount,
        deployHash: args.deployHash,
      });

      let scsprliquidityresult = await ScsprLiquidity.findOne({
        user: args.user,
      });
      if (scsprliquidityresult != null) {
        scsprliquidityresult.amount = (
          new bigdecimal.BigDecimal(scsprliquidityresult.amount).subtract(new bigdecimal.BigDecimal(args.amount))
        ).toString();
      }
      else{
        console.log("scsprliquidityresult is null...");
      }

      // updating mutation status
      let eventDataResult = await eventsData.findOne({
        _id: args.eventObjectId,
      });
      eventDataResult.status = "completed";
  
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
          // create new response
          response = new Response({
            id: "1",
          });
      }
      response.result = true;
      // Save changes in the database using a transaction
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await withdrawal.save({ session });
          await scsprliquidityresult.save({ session });
          await eventDataResult.save({ session });
          await response.save({ session });

        }, transactionOptions);

        return response;
      } catch (error) {
        throw new Error(error);
      } finally {
        // Ending the session
        await session.endSession();
      }
    } catch (error) {
      throw new Error(error);
    }
  },
};

const handleFormedLiquidity = {
  type: responseType,
  description: "Handle FormedLiquidity",
  args: {
    coverAmount: { type: GraphQLString },
    amountTokenA: { type: GraphQLString },
    amountTokenB: { type: GraphQLString },
    liquidity: { type: GraphQLString },
    deployHash: { type: GraphQLString },
    eventObjectId: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      let formedliquidityresult = await FormedLiquidity.findOne({
        id:
          process.env.WISETOKEN_PACKAGE_HASH +
          " - " +
          process.env.ERC20_PACKAGE_HASH +
          " - " +
          process.env.PAIR_PACKAGE_HASH,
      });
      if (formedliquidityresult == null) {
        formedliquidityresult = new FormedLiquidity({
          id:
            process.env.WISETOKEN_PACKAGE_HASH +
            " - " +
            process.env.ERC20_PACKAGE_HASH +
            " - " +
            process.env.PAIR_PACKAGE_HASH,
          tokenA: process.env.WISETOKEN_PACKAGE_HASH,
          tokenB: process.env.ERC20_PACKAGE_HASH,
          amountTokenA: args.amountTokenA,
          amountTokenB: args.amountTokenB,
          liquidity: args.liquidity,
          pair: process.env.PAIR_PACKAGE_HASH,
          to: process.env.ERC20_PACKAGE_HASH,
          coverAmount: args.coverAmount,
        });
      } else {
        formedliquidityresult.liquidity = args.liquidity;
        formedliquidityresult.coverAmount = args.coverAmount;
        formedliquidityresult.amountTokenA = (
          new bigdecimal.BigDecimal(formedliquidityresult.amountTokenA).add(new bigdecimal.BigDecimal(args.amountTokenA))
        ).toString();
        formedliquidityresult.amountTokenB = (
          new bigdecimal.BigDecimal(formedliquidityresult.amountTokenB).add(new bigdecimal.BigDecimal(args.amountTokenB))
        ).toString();
      }

      // updating mutation status
      let eventDataResult = await eventsData.findOne({
        _id: args.eventObjectId,
      });
      eventDataResult.status = "completed";
  
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
          // create new response
          response = new Response({
            id: "1",
          });
      }
      response.result = true;
      // Save changes in the database using a transaction
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await formedliquidityresult.save({ session });
          await eventDataResult.save({ session });
          await response.save({ session });

        }, transactionOptions);

        return response;
      } catch (error) {
        throw new Error(error);
      } finally {
        // Ending the session
        await session.endSession();
      }
    } catch (error) {
      throw new Error(error);
    }
  },
};

const handleLiquidityAdded = {
  type: responseType,
  description: "Handle LiquidityAdded",
  args: {
    amountWcspr: { type: GraphQLString },
    amountScspr: { type: GraphQLString },
    liquidity: { type: GraphQLString },
    eventObjectId: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      let uniswapswapresult = await UniswapSwapResult.findOne({
        id:
          process.env.WISETOKEN_PACKAGE_HASH +
          " - " +
          process.env.SYNTHETIC_CSPR_PACKAGE +
          " - " +
          process.env.PAIR_PACKAGE_HASH,
      });
      if (uniswapswapresult == null) {
        uniswapswapresult = new UniswapSwapResult({
          id:
            process.env.WISETOKEN_PACKAGE_HASH +
            " - " +
            process.env.SYNTHETIC_CSPR_PACKAGE +
            " - " +
            process.env.PAIR_PACKAGE_HASH,
          tokenA: process.env.WISETOKEN_PACKAGE_HASH,
          tokenB: process.env.SYNTHETIC_CSPR_PACKAGE,
          amountTokenA: args.amountWcspr,
          amountTokenB: args.amountScspr,
          liquidity: args.liquidity,
          pair: process.env.PAIR_PACKAGE_HASH,
          to: "hash-0000000000000000000000000000000000000000000000000000000000000000",
        });
      } else {
        uniswapswapresult.liquidity = args.liquidity;
        uniswapswapresult.amountTokenA = (
          new bigdecimal.BigDecimal(uniswapswapresult.amountTokenA).add(new bigdecimal.BigDecimal(args.amountWcspr))
        ).toString();
        uniswapswapresult.amountTokenB = (
          new bigdecimal.BigDecimal(uniswapswapresult.amountTokenB).add(new bigdecimal.BigDecimal(args.amountScspr))
        ).toString();
      }

      // updating mutation status
      let eventDataResult = await eventsData.findOne({
        _id: args.eventObjectId,
      });
      eventDataResult.status = "completed";
  
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
          // create new response
          response = new Response({
            id: "1",
          });
      }
      response.result = true;
      // Save changes in the database using a transaction
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await uniswapswapresult.save({ session });
          await eventDataResult.save({ session });
          await response.save({ session });

        }, transactionOptions);

        return response;
      } catch (error) {
        throw new Error(error);
      } finally {
        // Ending the session
        await session.endSession();
      }
    } catch (error) {
      throw new Error(error);
    }
  },
};

const handleLiquidityRemoved = {
  type: responseType,
  description: "Handle LiquidityRemoved",
  args: {
    amountWcspr: { type: GraphQLString },
    amountScspr: { type: GraphQLString },
    eventObjectId: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      let uniswapswapresult = await UniswapSwapResult.findOne({
        id:
          process.env.WISETOKEN_PACKAGE_HASH +
          " - " +
          process.env.SYNTHETIC_CSPR_PACKAGE +
          " - " +
          process.env.PAIR_PACKAGE_HASH,
      });

      if (uniswapswapresult != null) {
        uniswapswapresult.amountTokenA = (
          new bigdecimal.BigDecimal(uniswapswapresult.amountTokenA).subtract(new bigdecimal.BigDecimal(args.amountWcspr))
        ).toString();
        uniswapswapresult.amountTokenB = (
          new bigdecimal.BigDecimal(uniswapswapresult.amountTokenB).subtract(new bigdecimal.BigDecimal(args.amountScspr))
        ).toString();
      }
      else
      {
        console.log("uniswapswapresult is null...");
      }

      // updating mutation status
      let eventDataResult = await eventsData.findOne({
        _id: args.eventObjectId,
      });
      eventDataResult.status = "completed";
  
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
          // create new response
          response = new Response({
            id: "1",
          });
      }
      response.result = true;
      // Save changes in the database using a transaction
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          if(uniswapswapresult != null)
          {
            await uniswapswapresult.save({ session });
          }
          await eventDataResult.save({ session });
          await response.save({ session });

        }, transactionOptions);

        return response;
      } catch (error) {
        throw new Error(error);
      } finally {
        // Ending the session
        await session.endSession();
      }
    } catch (error) {
      throw new Error(error);
    }
  },
};

const handleMasterRecord = {
  type: responseType,
  description: "Handle MasterRecord",
  args: {
    masterAddress: { type: GraphQLString },
    amount: { type: GraphQLString },
    source: { type: GraphQLString },
    eventObjectId: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      let masterRecord = new MasterRecord({
        masterAddress: args.masterAddress,
        amount: args.amount,
        source: args.source,
      });

      // updating mutation status
      let eventDataResult = await eventsData.findOne({
        _id: args.eventObjectId,
        });
        eventDataResult.status = "completed";
  
        let response = await Response.findOne({ id: "1" });
        if (response === null) {
          // create new response
          response = new Response({
            id: "1",
          });
        }
        response.result = true;
  
        // Save changes in the database using a transaction
        const session = await mongoose.startSession();
        try {
          await session.withTransaction(async () => {
            await masterRecord.save({ session });
            await eventDataResult.save({ session });
            await response.save({ session });
  
          }, transactionOptions);
  
          return response;
        } catch (error) {
          throw new Error(error);
        } finally {
          // Ending the session
          await session.endSession();
        }
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = {
  handleReferralAdded,
  handleWiseReservation,
  handleRefundIssued,
  handleCashBackIssued,
  handleUniswapSwapedResult,
  handleDepositedLiquidity,
  handleWithdrawal,
  handleFormedLiquidity,
  handleLiquidityAdded,
  handleLiquidityRemoved,
  handleMasterRecord,
};

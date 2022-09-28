require("dotenv").config();
const {
  getOrCreateGlobal,
  createUser,
  ZERO,
  ONE,
  csprVal,
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
  let dayVal = day / BigInt(1000000000);
  switch (dayVal) {
    case BigInt(8):
    case BigInt(10):
      return MIN_SUPPLY_1;
    case BigInt(14):
    case BigInt(16):
    case BigInt(17):
      return MIN_SUPPLY_2;
    case BigInt(21):
    case BigInt(23):
    case BigInt(25):
      return MIN_SUPPLY_3;
    case BigInt(29):
    case BigInt(31):
      return MIN_SUPPLY_4;
    case BigInt(35):
    case BigInt(36):
    case BigInt(38):
      return MIN_SUPPLY_5;
    case BigInt(12):
    case BigInt(19):
    case BigInt(26):
    case BigInt(33):
    case BigInt(40):
    case BigInt(42):
    case BigInt(44):
    case BigInt(46):
    case BigInt(47):
    case BigInt(48):
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
    await Transaction.create(transaction);
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
        global.userCount = (BigInt(global.userCount) + BigInt(ONE)).toString();
      }
      // TODO refactor more == and maybe other operators
      if (referrer.reservationReferralCount == ZERO) {
        global.reservationReferrerCount = (
          BigInt(global.reservationReferrerCount) + BigInt(ONE)
        ).toString();
      }

      let refereeID = args.referee;
      let referee = await User.findOne({ id: refereeID });
      if (referee == null) {
        referee = await createUser(refereeID);
        global.userCount = (BigInt(global.userCount) + BigInt(ONE)).toString();
      }

      let reservedEffectiveEth =
        (BigInt(args.amount) * BigInt(11)) / BigInt(10);
      referee.reservationActualWei = (
        BigInt(referee.reservationActualWei) +
        BigInt(args.amount) -
        reservedEffectiveEth
      ).toString();
      global.reservationActualWei = (
        BigInt(global.reservationActualWei) +
        BigInt(args.amount) -
        reservedEffectiveEth
      ).toString();
      referee.save();

      let referralID = args.deployHash;
      let referral = new ReservationReferral({
        id: referralID,
        transaction: transaction.id,
        timestamp: transaction.timestamp,
        referrer: referrer.id,
        referee: referee.id,
        actualWei: args.amount,
      });
      await ReservationReferral.create(referral);

      let wasBelowCm = false;
      if (
        BigInt(referrer.reservationReferralActualWei) < CM_REFERRER_THRESHOLD
      ) {
        wasBelowCm = true;
      } else {
        wasBelowCm = false;
      }

      referrer.reservationReferralActualWei = (
        BigInt(referrer.reservationReferralActualWei) +
        BigInt(referral.actualWei)
      ).toString();
      referrer.reservationReferralCount = (
        BigInt(referrer.reservationReferralCount) + BigInt(ONE)
      ).toString();
      if (
        wasBelowCm &&
        BigInt(referrer.reservationReferralActualWei) >=
          CM_REFERRER_THRESHOLD &&
        referrer.cmStatus === false
      ) {
        referrer.cmStatus = true;
        referrer.cmStatusInLaunch = true;
        global.cmStatusCount = (
          BigInt(global.cmStatusCount) + BigInt(ONE)
        ).toString();
        global.cmStatusInLaunchCount = (
          BigInt(global.cmStatusInLaunchCount) + BigInt(ONE)
        ).toString();
      }
      await referrer.save();
      await global.save();

      transaction.referral = referral.id;
      await transaction.save();

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
      let nRes = BigInt(resList.length);
      let dayActualWei = BigInt(referral.actualWei) / nRes;
      let remainder = BigInt(referral.actualWei) % nRes;
      for (let i = 0; i < resList.length; i++) {
        let actualWei = i === 0 ? dayActualWei + remainder : dayActualWei;

        let res = resList[i];
        res.actualWei = actualWei.toString();
        await res.save();

        let uResDay = await UserReservationDay.findOne({
          id: res.user + "-" + res.investmentDay,
        });
        uResDay.actualWei = (
          BigInt(uResDay.actualWei) +
          BigInt(res.actualWei) -
          BigInt(res.effectiveWei)
        ).toString();
        await uResDay.save();

        let gResDay = await GlobalReservationDay.findOne({
          id: res.investmentDay,
        });
        gResDay.actualWei = (
          BigInt(gResDay.actualWei) +
          BigInt(res.actualWei) -
          BigInt(res.effectiveWei)
        ).toString();
        await gResDay.save();

        let gResDaySnapshot = new GlobalReservationDaySnapshot({
          id: res.investmentDay + "-" + args.timestamp,
          actualWei: gResDay.actualWei,
        });
        await GlobalReservationDaySnapshot.create(gResDaySnapshot);
      }
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
        });
        await response.save();
      }
      return response;
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
        BigInt(global.reservationCount) + BigInt(ONE)
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
        global.userCount = (BigInt(global.userCount) + BigInt(ONE)).toString();
      }
      if (user.reservationCount == ZERO) {
        global.reserverCount = (
          BigInt(global.reserverCount) + BigInt(ONE)
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
      await Reservation.create(reservation);

      user.reservationCount = (
        BigInt(user.reservationCount) + BigInt(ONE)
      ).toString();
      user.reservationEffectiveWei = (
        BigInt(user.reservationEffectiveWei) + BigInt(reservation.effectiveWei)
      ).toString();
      user.reservationActualWei = (
        BigInt(user.reservationActualWei) + BigInt(reservation.effectiveWei)
      ).toString();

      user.scsprContributed = (
        BigInt(user.scsprContributed) + BigInt(args.amount)
      ).toString();
      user.transferTokens = (
        BigInt(user.transferTokens) + BigInt(args.tokens)
      ).toString();

      global.reservationEffectiveWei = (
        BigInt(global.reservationEffectiveWei) +
        BigInt(reservation.effectiveWei)
      ).toString();
      global.reservationActualWei = (
        BigInt(global.reservationActualWei) + BigInt(reservation.effectiveWei)
      ).toString();

      global.totalScsprContributed = (
        BigInt(global.totalScsprContributed) + BigInt(args.amount)
      ).toString();
      global.totalTransferTokens = (
        BigInt(global.totalTransferTokens) + BigInt(args.tokens)
      ).toString();

      await global.save();
      await user.save();

      // let gResDayID = reservation.investmentDay;
      // let gResDay = await GlobalReservationDay.findOne({ id: gResDayID });
      // if (gResDay == null) {
      //   gResDay = new GlobalReservationDay({
      //     id: gResDayID,
      //     investmentDay: reservation.investmentDay,
      //     minSupply: getMinSupply(BigInt(reservation.investmentDay)).toString(),
      //     maxSupply: (
      //       MAX_SUPPLY - getMinSupply(BigInt(reservation.investmentDay))
      //     ).toString(),
      //     effectiveWei: ZERO,
      //     actualWei: ZERO,
      //     reservationCount: ZERO,
      //     userCount: ZERO,
      //   });
      //   await GlobalReservationDay.create(gResDay);
      // }
      // gResDay.effectiveWei = (
      //   BigInt(gResDay.effectiveWei) + BigInt(reservation.effectiveWei)
      // ).toString();
      // gResDay.actualWei = (
      //   BigInt(gResDay.actualWei) + BigInt(reservation.effectiveWei)
      // ).toString();
      // gResDay.reservationCount = (
      //   BigInt(gResDay.reservationCount) + BigInt(ONE)
      // ).toString();

      // let gResDaySnapshotID = reservation.investmentDay + "-" + args.timestamp;
      // let gResDaySnapshot = new GlobalReservationDaySnapshot({
      //   id: gResDaySnapshotID,
      //   timestamp: args.timestamp,
      //   investmentDay: gResDay.investmentDay,
      //   effectiveWei: gResDay.effectiveWei,
      //   actualWei: gResDay.actualWei,
      //   reservationCount: gResDay.reservationCount,
      // });
      // await GlobalReservationDaySnapshot.create(gResDaySnapshot);

      // let uResDayID = userID + "-" + reservation.investmentDay;
      // let uResDay = await UserReservationDay.findOne({ id: uResDayID });
      // if (uResDay == null) {
      //   uResDay = new UserReservationDay({
      //     id: uResDayID,
      //     user: user.id,
      //     investmentDay: reservation.investmentDay,
      //     effectiveWei: ZERO,
      //     actualWei: ZERO,
      //     reservationCount: ZERO,
      //   });
      //   await UserReservationDay.create(uResDay);
      //   gResDay.userCount = (
      //     BigInt(gResDay.userCount) + BigInt(ONE)
      //   ).toString();
      //   user.reservationDayCount = (
      //     BigInt(user.reservationDayCount) + BigInt(ONE)
      //   ).toString();
      // }
      // uResDay.effectiveWei = (
      //   BigInt(uResDay.effectiveWei) + BigInt(reservation.effectiveWei)
      // ).toString();
      // uResDay.actualWei = (
      //   BigInt(uResDay.actualWei) + BigInt(reservation.effectiveWei)
      // ).toString();
      // uResDay.reservationCount = (
      //   BigInt(uResDay.reservationCount) + BigInt(ONE)
      // ).toString();

      // await uResDay.save();
      // await gResDay.save();

      // gResDaySnapshot.userCount = gResDay.userCount;
      // await gResDaySnapshot.save();

      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
        });
        await response.save();
      }
      return response;
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
      await user.save();
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
        });
        await response.save();
      }
      return response;
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
      await global.save();

      let userID = args.senderAddress;
      let user = await createUser(userID);
      user.cashBackAmount = args.cashBackAmount;
      user.senderValue = args.senderValue;
      user.cashBackTransaction = args.deployHash;
      await user.save();
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
        });
        await response.save();
      }
      return response;
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
      await global.save();
      let uniswapswapresult = await UniswapSwapResult.findOne({
        id:
          process.env.WISETOKEN_PACKAGE_HASH +
          " - " +
          process.env.SYNTHETIC_CSPR_PACKAGE +
          " - " +
          process.env.PAIR_PACKAGE_HASH,
      });
       if (uniswapswapresult == null) {
        let newData = new UniswapSwapResult({
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
        await UniswapSwapResult.create(newData);
      } else {
        let response = await Response.findOne({ id: "2" });
        if (response === null) {
          // create new response
          response = new Response({
            id: "2",
            result: false,
          });
          await response.save();
        }
        return response;
      }
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
        });
        await response.save();
      }
      return response;
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
      let newData = new DepositedLiquidity({
        user: args.user,
        amount: args.amount,
        deployhash: args.deployHash,
      });

      await DepositedLiquidity.create(newData);

      let scsprliquidityresult = await ScsprLiquidity.findOne({
        user: args.user,
      });
      if (scsprliquidityresult == null) {
        let newData = new ScsprLiquidity({
          user: args.user,
          amount: args.amount,
        });

        await ScsprLiquidity.create(newData);
      } else {
        scsprliquidityresult.amount = (
          BigInt(scsprliquidityresult.amount) + BigInt(args.amount)
        ).toString();
        await scsprliquidityresult.save();
      }
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
        });
        await response.save();
      }
      return response;
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
      let newData = new Withdrawal({
        user: args.user,
        amount: args.amount,
        deployhash: args.deployHash,
      });

      await Withdrawal.create(newData);

      let scsprliquidityresult = await ScsprLiquidity.findOne({
        user: args.user,
      });
      if (scsprliquidityresult == null) {
        let response = await Response.findOne({ id: "1" });
        if (response === null) {
          // create new response
          response = new Response({
            id: "1",
            result: false,
          });
          await response.save();
        }
        return response;
      } else {
        scsprliquidityresult.amount = (
          BigInt(scsprliquidityresult.amount) - BigInt(args.amount)
        ).toString();
        await scsprliquidityresult.save();
      }
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
        });
        await response.save();
      }
      return response;
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
        let newData = new FormedLiquidity({
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

        await FormedLiquidity.create(newData);
      } else {
        formedliquidityresult.liquidity = args.liquidity;
        formedliquidityresult.coverAmount = args.coverAmount;
        formedliquidityresult.amountTokenA = (
          BigInt(formedliquidityresult.amountTokenA) + BigInt(args.amountTokenA)
        ).toString();
        formedliquidityresult.amountTokenB = (
          BigInt(formedliquidityresult.amountTokenB) + BigInt(args.amountTokenB)
        ).toString();

        await formedliquidityresult.save();
      }

      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
        });
        await response.save();
      }
      return response;
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
        let newData = new UniswapSwapResult({
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

        await UniswapSwapResult.create(newData);
      } else {
        uniswapswapresult.liquidity = args.liquidity;
        uniswapswapresult.amountTokenA = (
          BigInt(uniswapswapresult.amountTokenA) + BigInt(args.amountWcspr)
        ).toString();
        uniswapswapresult.amountTokenB = (
          BigInt(uniswapswapresult.amountTokenB) + BigInt(args.amountScspr)
        ).toString();

        await uniswapswapresult.save();
      }

      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
        });
        await response.save();
      }
      return response;
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

      if (uniswapswapresult == null) {
        let response = await Response.findOne({ id: "1" });
        if (response === null) {
          // create new response
          response = new Response({
            id: "1",
            result: false,
          });
          await response.save();
        }
        return response;
      } else {
        uniswapswapresult.amountTokenA = (
          BigInt(uniswapswapresult.amountTokenA) - BigInt(args.amountWcspr)
        ).toString();
        uniswapswapresult.amountTokenB = (
          BigInt(uniswapswapresult.amountTokenB) - BigInt(args.amountScspr)
        ).toString();

        await uniswapswapresult.save();
      }

      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
        });
        await response.save();
      }
      return response;
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
      let newData = new MasterRecord({
        masterAddress: args.masterAddress,
        amount: args.amount,
        source: args.source,
      });

      await MasterRecord.create(newData);

      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
        });
        await response.save();
      }
      return response;
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

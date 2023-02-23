// Import required stuff from graphql
const { GraphQLSchema, GraphQLObjectType } = require("graphql");

// Import queries
const { responses, response, user, global } = require("./queries");

const {
  handleGiveStatus,
  handleStakeStart,
  handleStakeEnd,
  handleInterestScraped,
  handleNewGlobals,
  handleNewSharePrice,
  handleUniswapReserves,
  handleLiquidityGuardStatus,
} = require("./wiseToken");

const {
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
} = require("./liquidityTransformer");

// Define QueryType
const QueryType = new GraphQLObjectType({
  name: "QueryType",
  description: "Queries",
  fields: {
    responses,
    response,
    user,
    global,
  },
});

// Define MutationType
const MutationType = new GraphQLObjectType({
  name: "MutationType",
  description: "Mutations",
  fields: {
    handleGiveStatus,
    handleStakeStart,
    handleStakeEnd,
    handleInterestScraped,
    handleNewGlobals,
    handleNewSharePrice,
    handleReferralAdded,
    handleWiseReservation,
    handleRefundIssued,
    handleCashBackIssued,
    handleUniswapSwapedResult,
    handleUniswapReserves,
    handleLiquidityGuardStatus,
    handleDepositedLiquidity,
    handleWithdrawal,
    handleFormedLiquidity,
    handleLiquidityAdded,
    handleLiquidityRemoved,
    handleMasterRecord,
  },
});

module.exports = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});

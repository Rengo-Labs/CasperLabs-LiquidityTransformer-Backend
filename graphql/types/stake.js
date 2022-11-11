const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
} = require("graphql");

const stakeType = new GraphQLObjectType({
  name: "stake",
  description: "stake type",
  fields: () => ({
    _id: { type: GraphQLID },
    id: {
      type: GraphQLString,
    },
    staker: {
      type: GraphQLString,
    },
    referrer: {
      type: GraphQLString,
    },
    principal: {
      type: GraphQLString,
    },
    shares: {
      type: GraphQLString,
    },
    cmShares: {
      type: GraphQLString,
    },
    currentShares: {
      type: GraphQLString,
    },
    startDay: {
      type: GraphQLString,
    },
    lockDays: {
      type: GraphQLString,
    },
    daiEquivalent: {
      type: GraphQLString,
    },
    reward: {
      type: GraphQLString,
    },
    closeDay: {
      type: GraphQLString,
    },
    penalty: {
      type: GraphQLString,
    },
    scrapedYodas: {
      type: GraphQLString,
    },
    sharesPenalized: {
      type: GraphQLString,
    },
    referrerSharesPenalized: {
      type: GraphQLString,
    },
    scrapeCount: {
      type: GraphQLString,
    },
    lastScrapeDay: {
      type: GraphQLString,
    },
    stakeEnd: {
      type: GraphQLBoolean,
    },
    currentStakeableDay: {
      type: GraphQLString,
    }
  }),
});

module.exports = { stakeType };

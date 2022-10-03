const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
} = require("graphql");

const reservationType = new GraphQLObjectType({
  name: "reservation",
  description: "reservation type",
  fields: () => ({
    _id: { type: GraphQLID },
    id: {
      type: GraphQLString,
    },
    transaction: {
      type: GraphQLString,
    },
    timestamp: {
      type: GraphQLString,
    },
    user: {
      type: GraphQLString,
    },
    investmentMode: {
      type: GraphQLString,
    },
    effectiveWei: {
      type: GraphQLString,
    },
    actualWei: {
      type: GraphQLString,
    },
    referral: {
      type: GraphQLString,
    },
    scsprContributed: {
      type: GraphQLString,
    },
    transferTokens: {
      type: GraphQLString,
    },
    currentWiseDay: {
      type: GraphQLString,
    },
  }),
});

module.exports = { reservationType };

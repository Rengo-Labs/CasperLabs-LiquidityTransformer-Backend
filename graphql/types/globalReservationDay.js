const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
} = require("graphql");

const globalReservationDayType = new GraphQLObjectType({
  name: "globalReservationDay",
  description: "globalReservationDay type",
  fields: () => ({
    _id: { type: GraphQLID },
    id: {
      type: GraphQLString,
    },
    currentWiseDay: {
      type: GraphQLString,
    },
    supply: {
      type: GraphQLString,
    },
    minSupply: {
      type: GraphQLString,
    },
    maxSupply: {
      type: GraphQLString,
    },
    effectiveWei: {
      type: GraphQLString,
    },
    actualWei: {
      type: GraphQLString,
    },
    reservationCount: {
      type: GraphQLString,
    },
    userCount: {
      type: GraphQLString,
    },
  }),
});

module.exports = { globalReservationDayType };

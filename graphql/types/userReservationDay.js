const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
} = require("graphql");

const userReservationDayType = new GraphQLObjectType({
  name: "userReservationDay",
  description: "userReservationDay type",
  fields: () => ({
    _id: { type: GraphQLID },
    id: {
      type: GraphQLString,
    },
    user: {
      type: GraphQLString,
    },
    currentWiseDay: {
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
  }),
});

module.exports = { userReservationDayType };

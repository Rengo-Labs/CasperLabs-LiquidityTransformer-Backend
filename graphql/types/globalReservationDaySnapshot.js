const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
} = require("graphql");

const globalReservationDaySnapshotType = new GraphQLObjectType({
  name: "globalReservationDaySnapshot",
  description: "globalReservationDaySnapshot type",
  fields: () => ({
    _id: { type: GraphQLID },
    id: {
      type: GraphQLString,
    },
    timestamp: {
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
    userCount: {
      type: GraphQLString,
    },
  }),
});

module.exports = { globalReservationDaySnapshotType };

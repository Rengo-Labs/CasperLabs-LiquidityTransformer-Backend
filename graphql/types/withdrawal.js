const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
} = require("graphql");

const withdrawalType = new GraphQLObjectType({
  name: "withdrawal",
  description: "withdrawal type",
  fields: () => ({
    _id: { type: GraphQLID },
    user: {
      type: GraphQLString,
    },
    amount: {
      type: GraphQLString,
    },
    deployHash: {
      type: GraphQLString,
    }
  }),
});

module.exports = { withdrawalType };

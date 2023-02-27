const { GraphQLString } = require("graphql");

// import types
const { userType } = require("./types/user");
const { globalType } = require("./types/global");

// import Models
const User = require("../models/user");
const Global = require("../models/global");

const user = {
  type: userType,
  description: "Retrieves user against user",
  args: {
    user: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let user = await User.findOne({ id: args.user });

      return user;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const global = {
  type: globalType,
  description: "Retrieves global against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let global = await Global.findOne({ id: args.id });

      return global;
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = {
  user,
  global,
};

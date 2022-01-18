require("dotenv").config();
const {
  GraphQLString
} = require("graphql");

var { request } = require("graphql-request");

const Response = require("../models/response");
const { responseType } = require("./types/response");

function splitdata(data) {
  var temp = data.split("(");
  var result = temp[1].split(")");
  return result[0];
}

const handleNewResponse = {
  type: responseType,
  description: "Handle New Response",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let response = await Response.findOne({ id: args.id });
      if (response === null) {
        // create new response
        response = new Response({
          id: args.id,
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
  handleNewResponse
};

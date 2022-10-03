var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const withdrawalSchema = new Schema({
  user: {
    type: String,
  },
  amount: {
    type: String,
  },
  deployHash: {
    type: String,
  },
});

var withdrawal = mongoose.model("withdrawal", withdrawalSchema);
module.exports = withdrawal;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const claimWiseSchema = new Schema({
  
  user: {
    type: String,
  },
  claimWise: {
    type: Boolean,
  }
  
});

var claimWise = mongoose.model("claimWise", claimWiseSchema);
module.exports = claimWise;
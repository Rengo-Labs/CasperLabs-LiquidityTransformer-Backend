var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const liquidityGuardStatusSchema = new Schema({
  id: {
    type: String,
  },
  liquidityGuardStatus: {
    type: Boolean,
  },
});

var liquidityGuardStatus = mongoose.model(
  "liquidityGuardStatus",
  liquidityGuardStatusSchema
);
module.exports = liquidityGuardStatus;

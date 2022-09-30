var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const reservationSchema = new Schema({
  id: {
    type: String,
  },
  transaction: {
    type: String,
  },
  timestamp: {
    type: String,
  },
  user: {
    type: String,
  },
  investmentMode: {
    type: String,
  },
  effectiveWei: {
    type: String,
  },
  actualWei: {
    type: String,
  },
  referral: {
    type: String,
  },
  scsprContributed: {
    type: String,
  },
  transferTokens: {
    type: String,
  },
  currentWiseDay: {
    type: String,
  },
});

var reservation = mongoose.model("reservation", reservationSchema);
module.exports = reservation;

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const globalReservationDaySchema = new Schema({
  id: {
    type: String,
  },
  currentWiseDay: {
    type: String,
  },
  supply: {
    type: String,
  },
  minSupply: {
    type: String,
  },
  maxSupply: {
    type: String,
  },
  effectiveWei: {
    type: String,
  },
  actualWei: {
    type: String,
  },
  reservationCount: {
    type: String,
  },
  userCount: {
    type: String,
  },
});

var globalReservationDay = mongoose.model(
  "globalReservationDay",
  globalReservationDaySchema
);
module.exports = globalReservationDay;

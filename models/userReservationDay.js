var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const userReservationDaySchema = new Schema({
  id: {
    type: String,
  },
  user: {
    type: String,
  },
  currentWiseDay: {
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
});

var userReservationDay = mongoose.model(
  "userReservationDay",
  userReservationDaySchema
);
module.exports = userReservationDay;

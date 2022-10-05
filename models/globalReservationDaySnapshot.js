var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const globalReservationDaySnapshotSchema = new Schema({
  id: {
    type: String,
  },
  timestamp: {
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
  userCount: {
    type: String,
  },
});

var globalReservationDaySnapshot = mongoose.model(
  "globalReservationDaySnapshot",
  globalReservationDaySnapshotSchema
);
module.exports = globalReservationDaySnapshot;

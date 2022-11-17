var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const stakeSchema = new Schema(
  {
    id: {
      type: String,
    },
    staker: {
      type: String,
    },
    referrer: {
      type: String,
    },
    referrerId: {
      type: String,
    },
    principal: {
      type: String,
    },
    shares: {
      type: String,
    },
    cmShares: {
      type: String,
    },
    currentShares: {
      type: String,
    },
    startDay: {
      type: String,
    },
    lockDays: {
      type: String,
    },
    daiEquivalent: {
      type: String,
    },
    reward: {
      type: String,
    },
    closeDay: {
      type: String,
    },
    penalty: {
      type: String,
    },
    scrapedYodas: {
      type: String,
    },
    sharesPenalized: {
      type: String,
    },
    referrerSharesPenalized: {
      type: String,
    },
    scrapeCount: {
      type: String,
    },
    lastScrapeDay: {
      type: String,
    },
    stakeEnd: {
      type: Boolean,
    },
    currentStakeableDay: {
      type: String,
    },
  },
  { timestamps: true }
);

var stake = mongoose.model("stake", stakeSchema);
module.exports = stake;

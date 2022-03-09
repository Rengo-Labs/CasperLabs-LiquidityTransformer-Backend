var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const formedLiquiditySchema = new Schema({
  id: {
    type: String,
  },
  tokenA: {
    type: String,
  },
  tokenB: {
    type: String,
  },
  amounttokenA: {
    type: String,
  },
  amounttokenB: {
    type: String,
  },
  liquidity: {
    type: String,
  },
  pair: {
    type: String,
  },
  to: {
    type: String,
  },
  coverAmount: {
    type: String,
  },
});

var formedLiquidity = mongoose.model("formedLiquidity", formedLiquiditySchema);
module.exports = formedLiquidity;

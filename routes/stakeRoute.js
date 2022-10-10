const express = require("express");
const router = express.Router();
const Stake = require('../models/stake');

router.route("/getStakeData/:stakerId").get(async(req, res, next) =>{
    try {
      if (!req.params.stakerId) {
        return res.status(400).json({
          success: false,
          message: "There is no stakerId specified in the req params.",
        });
      }
      const stakes = await Stake.find({staker:req.params.stakerId});
      if (stakes.length==0) {
        return res.status(400).json({
          success: false,
          message: "There is no data in Stake Model against this stakerId...",
        });
      } else {
        return res.status(200).json({
            success: true,
            message: "Stake Data against stakerId has been Successfully received",
            stakesData: stakes
          });
      }
    } catch (error) {
      console.log("error (try-catch) : " + error);
      return res.status(500).json({
        success: false,
        err: error,
      });
    }
  });

module.exports = router;
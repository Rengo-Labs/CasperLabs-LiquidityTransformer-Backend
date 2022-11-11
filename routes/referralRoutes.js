const express = require("express");
const router = express.Router();
const Stake = require('../models/stake');

router.route("/getReferrerData/:referrerId").get(async(req, res, next) =>{
    try {
      if (!req.params.referrerId) {
        return res.status(400).json({
          success: false,
          message: "There is no referrerId specified in the req params.",
        });
      }
      const referrerData = await Stake.find({referrer:req.params.referrerId});
      if (referrerData.length==0) {
        return res.status(400).json({
          success: false,
          message: "There is no data in Stake Model against this referrerId...",
        });
      } else {
        return res.status(200).json({
            success: true,
            message: "Referrer Data against referrerId has been Successfully received",
            referrerData: referrerData
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
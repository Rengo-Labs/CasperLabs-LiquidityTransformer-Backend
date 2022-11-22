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

router.route("/addReferrer").post(async(req, res, next) =>{
  try {
    if (!req.body.stakeId) {
      return res.status(400).json({
        success: false,
        message: "There is no stakeId specified in the req body.",
      });
    }
    if (!req.body.referrerId) {
      return res.status(400).json({
        success: false,
        message: "There is no referrerId specified in the req body.",
      });
    }
    const stakeData = await Stake.findOne({id:req.body.stakeId});
    if (stakeData==null) {
      return res.status(400).json({
        success: false,
        message: "There is no data in Stake Model against this stakeId...",
      });
    } else {
      stakeData.referrerId=req.body.referrerId;
      await stakeData.save();
      return res.status(200).json({
          success: true,
          message: "ReferrerId has been Successfully saved in stake"
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
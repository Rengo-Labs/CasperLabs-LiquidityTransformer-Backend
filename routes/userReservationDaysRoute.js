const express = require("express");
const router = express.Router();
const userReservationDayModel = require('../models/userReservationDay');

router.route("/userReservationDaysData").post(async function (req, res, next) {
  try {

    if (!req.body.user) {
      return res.status(400).json({
        success: false,
        message: "user not found in request body",
      });
    }
    let userReservationDaysData =await userReservationDayModel.find({user:req.body.user});
    if(userReservationDaysData.length == 0)
    {
        return res.status(400).json({
        success: false,
        message: "userReservationDays data is empty...",
        });
    }
    return res.status(200).json({
      success: true,
      message: "userReservationDays data has been found successfully...",
      userReservationDaysData:userReservationDaysData
    });
  } catch (error) {
    console.log("error (try-catch) : " + error);
    return res.status(500).json({
      success: false,
      err: error,
    });
  }
});

module.exports = router;

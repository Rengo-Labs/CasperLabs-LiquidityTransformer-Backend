const express = require("express");
const router = express.Router();
const globalReservationDayModel = require('../models/globalReservationDay');

router.route("/globalReservationDaysData").get(async function (req, res, next) {
  try {

    let globalReservationDaysData =await globalReservationDayModel.find({});
    if(globalReservationDaysData.length == 0)
    {
        return res.status(400).json({
        success: false,
        message: "globalReservationDays data is empty...",
        });
    }
    return res.status(200).json({
      success: true,
      message: "globalReservationDays data has been found successfully...",
      globalReservationDaysData:globalReservationDaysData
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

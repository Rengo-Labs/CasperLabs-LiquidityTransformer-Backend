require("dotenv").config();
var express = require("express");
var router = express.Router();
var claimWiseModel=require('../models/claimWise');

router.route("/claimWise").post(async function (req, res, next) {
    try {
  
    if(!req.body.user)
    {
        return res.status(400).json({
            success: false,
            message: "User not found in the request body.",
        });
    }
    var claimWiseData= await claimWiseModel.findOne({user:req.body.user});
    if(claimWiseData != null)
    {
        return res.status(200).json({
            success: true,
            message: "User has already claimed wise.",
        });
    }
    else{
        var newData= new claimWiseModel({
            user:req.body.user,
            claimWise:true
        });
        await claimWiseModel.create(newData);
    }
    return res.status(200).json({
        success: true,
        message: "User has successfully claimedWise. ",
    });
      
    } catch (error) {
      console.log("error (try-catch) : " + error);
      return res.status(500).json({
        success: false,
        err: error,
      });
    }
});

router.route("/getClaimWiseStatus/:user").get(async function (req, res, next) {
  try {

    if(!req.params.user)
    {
        return res.status(400).json({
            success: false,
            message: "User not found in the request params.",
        });
    }
    var claimWiseData= await claimWiseModel.findOne({user:req.params.user});
    if(claimWiseData == null)
    {
        return res.status(200).json({
            success: true,
            message: "User has not claimed wise.",
            claimWiseStatus: false
        });
    }
    else{
        if(claimWiseData.claimWise == true)
        {
            return res.status(200).json({
                success: true,
                message: "User has claimed wise.",
                claimWiseStatus: true
            });
        }
        else{
            return res.status(200).json({
                success: true,
                message: "User has not claimed wise.",
                claimWiseStatus:false
            });
        }
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

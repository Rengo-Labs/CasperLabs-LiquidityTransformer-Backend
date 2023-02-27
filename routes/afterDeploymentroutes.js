require("dotenv").config();
var express = require("express");
var router = express.Router();
const auth = require("../middlewares/auth");
const passport = require("passport");
const verifyAdmin = passport.authenticate("jwt", {
  session: false,
});
var allcontractsDataModel = require("../models/allcontractsData");

/**
 * @swagger
 * components:
 *   schemas:
 *     AllContractAndPackage:
 *       type: object
 *       required:
 *         - contractHash
 *         - packageHash
 *       properties:
 *         contractHash:
 *           type: string
 *           description: The contractHash of all contracts.
 *         packageHash:
 *           type: string
 *           description: The packageHash of all contracts.
 */

/**
 * @swagger
 * /addcontractandpackageHash:
 *   post:
 *     description: This endpoint is used to store all contracts data.
 *     tags: [AllContractAndPackage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contractHash:
 *                 type: string
 *               packageHash:
 *                 type: string
 *           examples:
 *             '1':
 *               value: "{\r\n    \"contractHash\":\"fc8f50347269ab7838575d75e4daeff07b109a218fcc0b8868e047e3e2ccf23e\",\r\n      \"packageHash\":\"265c42eead5c2aa5759b9713843fe6a3c8f531d6169d1aa11fcd2e15fd80a0bf\"\r\n}"
 *             '2':
 *               value: "{\r\n    \"contractHash\":\"fc8f50347269ab7838575d75e4daeff07b109a218fcc0b8868e047e3e2ccf23e\",\r\n      \"packageHash\":\"265c42eead5c2aa5759b9713843fe6a3c8f531d6169d1aa11fcd2e15fd80a0bf\"\r\n}"
 *
 *     responses:
 *       200:
 *         description: If Contract and Package Hash are Succefully stored.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: {
 *                         "responseStatus": {
 *                             "success": true,
 *                             "errorCode": 0,
 *                             "errorMessage": "",
 *                             "error": null
 *                         },
 *                         "body": {
 *                             "message": "Contract and Package Hash are Succefully stored."
 *                         }
 *                     }
 *
 *       406:
 *         description: If Contract and Package Hash are already added.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: {
 *                           "responseStatus": {
 *                             "success": false,
 *                             "errorCode": 406,
 *                             "errorMessage": "Contract and Package Hash are already added.",
 *                             "error": {}
 *                           },
 *                           "body": null
 *                         }
 */ 

router
  .route("/addcontractandpackageHash")
  .post(auth.verifyToken, verifyAdmin, async function (req, res, next) {
    try {
      if (!req.body.contractHash) {
        return res.status(400).json({
          success: false,
          message: "There is no contractHash specified in the req body.",
        });
      }
      if (!req.body.packageHash) {
        return res.status(400).json({
          success: false,
          message: "There is no packageHash specified in the req body.",
        });
      }

      let contractHash = req.body.contractHash.toLowerCase();
      let packageHash = req.body.packageHash.toLowerCase();
      let contractsData = await allcontractsDataModel.findOne({
        contractHash: contractHash,
        packageHash: packageHash,
      });
      if (contractsData == null) {
        var newpair = new allcontractsDataModel({
          contractHash: contractHash,
          packageHash: packageHash,
        });
        await allcontractsDataModel.create(newpair);

        return res.status(200).json({
          success: true,
          message: "Contract and Package Hash are Succefully stored.",
        });
      } else {
        return res.status(406).json({
          success: false,
          message: "These Contract and Package Hash are already stored.",
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

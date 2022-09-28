# Casper_Wise_V2 GraphQL

Casper Wise is an innovative and highly secure DeFi ecosystem.

This is the official WISE graphQL code for the Casper network.

## Running Locally

npm install to install the require packages
npm start to start the server

AWS Link: http://wisegraphqlbackendfinalized-env-1.eba-kecy6vfp.us-east-1.elasticbeanstalk.com/

Endpoints Documentation Link:  

https://docs.google.com/document/d/1vyNzyHQdJMF0YG0co8cLKs7fq4T_71R2KtmSGAez4FY/edit?usp=sharing

Smart Contract Documentation Link: 

https://docs.google.com/document/d/19ECYDI-z4d1-UBpL6iHBkgL6xebHtGd79i35O1Kbfms/edit?usp=sharing

## Running Testcases 

- Change NODE_MODE to developement (For not mixing the real database)
- npm install to install the require packages,
- npm start to start the server
- open another terminal and node test.js to run the test cases


## Deployment of Contracts

#### Generate the keys

Paste this command on the ubuntu terminal, that will create a keys folder for you containing public key , public key hex and secret key.

```
casper-client keygen keys

```
#### Paste the keys

Paste the keys folder created by the above command to Scripts/LIQUIDITYTRANSFORMER and Scripts/WISETOKEN folders.

#### Fund the key

We can fund the keys from casper live website faucet page on testnet.

Use the script file in package.json to perform the deployments
```
  "scripts": {
    "deploy:liquidityTransformer": "ts-node Scripts/LIQUIDITYTRANSFORMER/deploy/liquidityTransformerContract.ts",
    "deploy:liquidityTransformerFunctions": "ts-node Scripts/LIQUIDITYTRANSFORMER/deploy/liquidityTransformerContractFunction.ts",
    "deploy:wiseToken": "ts-node Scripts/WISETOKEN/deploy/wiseContract.ts",
    "deploy:wiseTokenFunctions": "ts-node Scripts/WISETOKEN/deploy/wiseContractFunction.ts"
  },
  
```

Use the following commands to perform deployments
```

npm run deploy:liquidityTransformer
npm run deploy:liquidityTransformerFunctions

npm run deploy:wiseToken
npm run deploy:wiseTokenFunctions

```

* CONFIGURE .env BEFORE and during DEPLOYMENT

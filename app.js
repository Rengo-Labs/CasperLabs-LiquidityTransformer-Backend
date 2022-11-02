var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql/schema");

//routers
var adminRouter = require("./routes/adminroutes");
var afterDeploymentRouter = require("./routes/afterDeploymentroutes");
var listenerRouter = require("./routes/listenerroutes");
const depositedLiquidityRoute = require("./routes/depositedLiquidityRoute");
const formedLiquidityRoute = require("./routes/formedLiquidityRoute");
const masterRecordRoute = require("./routes/masterRecordRoute");
const withdrawalRoute = require("./routes/withdrawalRoute");
const uniswapSwapResultRoute = require("./routes/uniswapSwapResultRoutes");
const stakeRoute = require("./routes/stakeRoute");
const globalRoutes = require("./routes/globalRoutes");
const userRoutes = require("./routes/userRoute");
const readWasmRouter = require("./routes/readWasm");
const userReservationDaysRoute = require("./routes/userReservationDaysRoute");
const globalReservationDaysRoute = require("./routes/globalReservationDaysRoute");
const claimWiseRoute = require("./routes/claimWiseRoute");

var eventsDataModel = require("./models/eventsData");

//calling forwardLiquidity script
//require("./Scripts/LIQUIDITYTRANSFORMER/deploy/forwardLiquidity.ts");

//kafka setup
const consumer = require('./consumer');

// connecting to the database
require("./dbConnection");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Connect to Redis
var redis = require('./connectRedis');

//function to deserialize Event Data
function deserialize(serializedJavascript){
  return eval('(' + serializedJavascript + ')');
}



app.use("/", adminRouter);
app.use("/", afterDeploymentRouter);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.get("/", (req, res) => {
  res.json({ msg: "Wise GraphQL Backend" });
});

app.use("/", listenerRouter.router);
app.use("/", depositedLiquidityRoute);
app.use("/", formedLiquidityRoute);
app.use("/", masterRecordRoute);
app.use("/", withdrawalRoute);
app.use("/", uniswapSwapResultRoute);
app.use("/", stakeRoute);
app.use("/", globalRoutes);
app.use("/", userRoutes);
app.use("/", readWasmRouter);
app.use("/", userReservationDaysRoute);
app.use("/", globalReservationDaysRoute);
app.use("/", claimWiseRoute);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

consumer.consumeEvent(redis);

var queuePopFlag=0;

async function saveEventInDataBase(deployHash,eventName,timestamp,blockHash,eventsdata)
{
  let eventResult= new eventsDataModel ({
    deployHash:deployHash,
    eventName:eventName,
    timestamp:timestamp,
    block_hash: blockHash,
    status:"pending",
    eventType:"NotSame",
    eventsdata:eventsdata
  });
  await eventsDataModel.create(eventResult);
  return eventResult;
}

async function callMutations()
{
  if(queuePopFlag==0)
  {
    let redisLength=await redis.client.LLEN(process.env.GRAPHQLREDISQUEUE);
    
    //check redis queue length
    if(redisLength>0)
    {
        queuePopFlag=1;
        let headValue=await redis.client.LRANGE(process.env.GRAPHQLREDISQUEUE,0,0);
        let deserializedHeadValue=(deserialize(headValue)).obj;
        console.log("Event Read from queue's head: ", deserializedHeadValue);

        //check if event is in the database
        let eventResult= await eventsDataModel.findOne({
          deployHash:deserializedHeadValue.deployHash,
          eventName:deserializedHeadValue.eventName,
          timestamp:deserializedHeadValue.timestamp,
          block_hash: deserializedHeadValue.block_hash
        });

        if(eventResult!=null && JSON.stringify(eventResult.eventsdata) == JSON.stringify(deserializedHeadValue.eventsdata) && eventResult.status == "completed"){
          console.log("Event is repeated, skipping mutation call...");
        }  
        else{
  
          if(eventResult==null)
          {
              console.log("Event is New, Calling Mutation...");
              //store new event Data
              let result =await saveEventInDataBase(deserializedHeadValue.deployHash,deserializedHeadValue.eventName,deserializedHeadValue.timestamp,deserializedHeadValue.block_hash,deserializedHeadValue.eventsdata);
              //call mutation
              await listenerRouter.geteventsdata(result,deserializedHeadValue.deployHash, deserializedHeadValue.timestamp, deserializedHeadValue.block_hash, deserializedHeadValue.eventName, deserializedHeadValue.eventsdata);
          }
          else{
            if(JSON.stringify(eventResult.eventsdata) != JSON.stringify(deserializedHeadValue.eventsdata)){
              if(eventResult.eventType == "NotSame")
              {
                console.log("Event has same EventName, Calling Mutation...");
                //store new event Data
                let result =await saveEventInDataBase(deserializedHeadValue.deployHash,deserializedHeadValue.eventName,deserializedHeadValue.timestamp,deserializedHeadValue.block_hash,deserializedHeadValue.eventsdata);
                result.eventType="same";
                eventResult.eventType="same";
                await result.save();
                await eventResult.save();
                //call mutation
                await listenerRouter.geteventsdata(result,deserializedHeadValue.deployHash, deserializedHeadValue.timestamp, deserializedHeadValue.block_hash, deserializedHeadValue.eventName, deserializedHeadValue.eventsdata);
              }
              else{
                console.log("Event is repeated, skipping mutation call...");
              }
            }
            else if(eventResult.status == "pending"){
              console.log("Event is Not performed Yet, Calling Mutation...");
              //call mutation
              await listenerRouter.geteventsdata(eventResult,deserializedHeadValue.deployHash, deserializedHeadValue.timestamp, deserializedHeadValue.block_hash, deserializedHeadValue.eventName, deserializedHeadValue.eventsdata);
            }
          }
        }
        await redis.client.LPOP(process.env.GRAPHQLREDISQUEUE);
        queuePopFlag=0; 
    }
    else{
      console.log("There are currently no Events in the Redis queue...");
      return;
    }
  }
  else{
    console.log("Already, one Event is calling the mutation...");
    return;
  }
}

setInterval(() => {
  callMutations();
}, 2000);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
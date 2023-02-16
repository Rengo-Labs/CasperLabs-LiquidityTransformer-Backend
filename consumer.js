//for all env variables imports
require("dotenv").config();

//setting up kafka
const kafka=require("./kafka"); 

var eventsDataModel = require("./models/eventsData");
var listenerRouter = require("./routes/listenerroutes");
//creating a consumer
const consumer = kafka.consumer({ groupId: process.env.TOPIC, retries: Number.MAX_VALUE  });

// import library to serialize Events Data
var serialize = require('serialize-javascript');

function deserialize(serializedJavascript) {
  return eval("(" + serializedJavascript + ")");
}

var queuePopFlag = 0;

async function saveEventInDataBase(
  deployHash,
  eventName,
  timestamp,
  blockHash,
  eventsdata
) {
  let eventResult = new eventsDataModel({
    deployHash: deployHash,
    eventName: eventName,
    timestamp: timestamp,
    block_hash: blockHash,
    status: "pending",
    eventType: "NotSame",
    eventsdata: eventsdata,
  });
  await eventsDataModel.create(eventResult);
  return eventResult;
}

async function callMutations(redis) {
  if (queuePopFlag == 0) {
    let redisLength = await redis.client.LLEN(process.env.GRAPHQLREDISQUEUE);

    //check redis queue length
    if (redisLength > 0) {
      queuePopFlag = 1;
      let headValue = await redis.client.LRANGE(
        process.env.GRAPHQLREDISQUEUE,
        0,
        0
      );
      let deserializedHeadValue = deserialize(headValue).obj;
      console.log("Event Read from queue's head: ", deserializedHeadValue);

      //check if event is in the database
      let eventResult = await eventsDataModel.findOne({
        deployHash: deserializedHeadValue.deployHash,
        eventName: deserializedHeadValue.eventName,
        timestamp: deserializedHeadValue.timestamp,
        block_hash: deserializedHeadValue.block_hash,
      });

      if (
        eventResult != null &&
        JSON.stringify(eventResult.eventsdata) ==
          JSON.stringify(deserializedHeadValue.eventsdata) &&
        eventResult.status == "completed"
      ) {
        console.log("Event is repeated, skipping mutation call...");
      } else {
        if (eventResult == null) {
          console.log("Event is New, Calling Mutation...");
          //store new event Data
          let result = await saveEventInDataBase(
            deserializedHeadValue.deployHash,
            deserializedHeadValue.eventName,
            deserializedHeadValue.timestamp,
            deserializedHeadValue.block_hash,
            deserializedHeadValue.eventsdata
          );
          //call mutation
          await listenerRouter.geteventsdata(
            result,
            deserializedHeadValue.deployHash,
            deserializedHeadValue.timestamp,
            deserializedHeadValue.block_hash,
            deserializedHeadValue.eventName,
            deserializedHeadValue.eventsdata
          );
        } else {
          if (
            JSON.stringify(eventResult.eventsdata) !=
            JSON.stringify(deserializedHeadValue.eventsdata)
          ) {
            if (eventResult.eventType == "NotSame") {
              console.log("Event has same EventName, Calling Mutation...");
              //store new event Data
              let result = await saveEventInDataBase(
                deserializedHeadValue.deployHash,
                deserializedHeadValue.eventName,
                deserializedHeadValue.timestamp,
                deserializedHeadValue.block_hash,
                deserializedHeadValue.eventsdata
              );
              result.eventType = "same";
              eventResult.eventType = "same";
              await result.save();
              await eventResult.save();
              //call mutation
              await listenerRouter.geteventsdata(
                result,
                deserializedHeadValue.deployHash,
                deserializedHeadValue.timestamp,
                deserializedHeadValue.block_hash,
                deserializedHeadValue.eventName,
                deserializedHeadValue.eventsdata
              );
            } else {
              console.log("Event is repeated, skipping mutation call...");
            }
          } else if (eventResult.status == "pending") {
            console.log("Event is Not performed Yet, Calling Mutation...");
            //call mutation
            await listenerRouter.geteventsdata(
              eventResult,
              deserializedHeadValue.deployHash,
              deserializedHeadValue.timestamp,
              deserializedHeadValue.block_hash,
              deserializedHeadValue.eventName,
              deserializedHeadValue.eventsdata
            );
          }
        }
      }
      await redis.client.LPOP(process.env.GRAPHQLREDISQUEUE);
      queuePopFlag = 0;
    } else {
      console.log("There are currently no Events in the Redis queue...");
      return;
    }
  } else {
    console.log("Already, one Event is calling the mutation...");
    return;
  }
}



async function consumeEvent (redis)
{
    try {
        //connection a producer
        await consumer.connect();

        //subcribing the topic to consume data
        await consumer.subscribe({ topic: process.env.TOPIC});

        //consuming data
        await consumer.run({
          eachBatchAutoResolve: false,
          eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
              for (let message of batch.messages) {
                  if (!isRunning() || isStale())
                  {
                    break;
                  } 

                  console.log(`Consumed event from topic ${batch.topic}: value = ${message.value}`);
                  let _value = JSON.parse(message.value.toString());
                  
                  //push event to redis queue
                  await redis.client.RPUSH(process.env.GRAPHQLREDISQUEUE,serialize({obj:_value}));
                  console.log("Event pushed to queue...");
                  let interval = setInterval(async () => {
                    console.log("Heartbeat Signaled...");
                    heartbeat();
                  }, 15000)
                  await callMutations(redis);
                  clearInterval(interval);
                  //committing offset
                  resolveOffset(message.offset);
                  await heartbeat();
                  console.log("Offset Committed...");
                  console.log("Heartbeat Signaled...");
              }
          }
        });

        process.on('SIGINT', () => {
          console.log('\nDisconnecting consumer and shutting down Graphql backend ...');
          consumer.disconnect();
          process.exit(0);
        });
    } 
    catch (error) {
        console.error('Error listening message', error)
    }
}

module.exports = {consumeEvent};
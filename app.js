var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var app = express();
require("dotenv").config();
const { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql/schema");

//routers
const adminRouter = require("./routes/adminroutes");
const afterDeploymentRouter = require("./routes/afterDeploymentroutes");
const listenerRouter = require("./routes/listenerroutes");
const stakeRoute = require("./routes/stakeRoute");
const globalRoutes = require("./routes/globalRoutes");
const referralRoutes = require("./routes/referralRoutes");
const userRoutes = require("./routes/userRoute");
const readWasmRouter = require("./routes/readWasm");
const userReservationDaysRoute = require("./routes/userReservationDaysRoute");
const globalReservationDaysRoute = require("./routes/globalReservationDaysRoute");
const claimWiseRoute = require("./routes/claimWiseRoute");
const pairRoutes = require("./routes/pairRoutes");


//calling forwardLiquidity script
//require("./Scripts/LIQUIDITYTRANSFORMER/deploy/forwardLiquidity.ts");

//kafka setup
const consumer = require('./consumer');

// connecting to the database
require("./dbConnection");

//connecting database's backup file  
require("./backupDatabase");

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
app.use("/", stakeRoute);
app.use("/", globalRoutes);
app.use("/", referralRoutes);
app.use("/", userRoutes);
app.use("/", readWasmRouter);
app.use("/", userReservationDaysRoute);
app.use("/", globalReservationDaysRoute);
app.use("/", claimWiseRoute);
app.use("/", pairRoutes);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

consumer.consumeEvent(redis);

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
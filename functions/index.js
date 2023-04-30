const functions = require("firebase-functions");
const cors = require("cors");
const app = require("express")();

// Enable CORS
app.use(cors());

const { adminLogin } = require("./handles/auth");

const {
  listClients,
  createClient,
  updateClient,
  deleteClient,
} = require("./handles/clients");

const {
  createUser,
  updateUserData,
  deleteUserData,
  getUserData,
  getUsersData,
} = require("./handles/users");

const {
  createFunctionsData,
  updateFunctionData,
  deleteFunctionData,
  getFunctionData,
  getFunctionsData,
} = require("./handles/functions");

const {
  createShift,
  updateShiftData,
  deleteShiftData,
  getShiftData,
  getShiftsData,
} = require("./handles/shifts");

const { FBAAuth } = require("./utils/FBAuth");

/*
==================
 AUTHENTICATION API
==================
*/
// admin
app.post("/admin-login", adminLogin);

// user

/*
==================
 USERS API
==================
*/

app.post("/create-user", FBAAuth, createUser); //fix it
app.put("/update-user/:id", FBAAuth, updateUserData); //fix it (Test it)
app.delete("/delete-user/:id", FBAAuth, deleteUserData);
app.get("/get-user/:id", FBAAuth, getUserData);
app.get("/get-users", FBAAuth, getUsersData);

/*
==================
 FUNCTIONS API
==================
*/

app.post("/create-function", FBAAuth, createFunctionsData); //fix it
app.put("/update-function/:id", FBAAuth, updateFunctionData); //fix it
app.delete("/delete-function/:id", FBAAuth, deleteFunctionData);
app.get("/get-function/:id", FBAAuth, getFunctionData);
app.get("/get-functions", FBAAuth, getFunctionsData);

/*
==================
 SHIFT API
==================
*/

app.post("/create-shift", FBAAuth, createShift); //fix it
app.put("/update-shift/:id", FBAAuth, updateShiftData); //fix it
app.delete("/delete-shift/:id", FBAAuth, deleteShiftData);
app.get("/get-shift/:id", FBAAuth, getShiftData);
app.get("/get-shifts", FBAAuth, getShiftsData);

/*
==================
 CLIENTS API
==================
*/

app.get("/getClients", FBAAuth, listClients);
app.post("/addClient", FBAAuth, createClient);
app.put("/updateClient/:uid", FBAAuth, updateClient);
app.get("/deleteClient/:uid", FBAAuth, deleteClient);

exports.api = functions.region("europe-west1").https.onRequest(app);

// *****************************************
// user
// app.post("/signIn", userLogin);
// user api

// app.post("/initialChangePassword", initialChangePassword);

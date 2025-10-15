const express = require("express");
const clientController = require("../Controllers/clientController.js");

const clientRouter = express.Router();

clientRouter.get("/addClient", clientController.addClient);
clientRouter.post("/postAddClient", clientController.postAddClient);
clientRouter.get("/editClient/:ClientId", clientController.editClient);
clientRouter.post("/postEditClient", clientController.postEditClient);
clientRouter.get("/", clientController.getClients);

module.exports = clientRouter;
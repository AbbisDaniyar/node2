const express = require("express");
const tovarController = require("../Controllers/tovarController.js");

const tovarRouter = express.Router();

tovarRouter.get("/addTovar", tovarController.addTovar);
tovarRouter.post("/postAddTovar", tovarController.postAddTovar);
tovarRouter.get("/editTovar/:TovarId", tovarController.editTovar);
tovarRouter.post("/postEditTovar", tovarController.postEditTovar);
tovarRouter.post("/deleteTovar/:TovarId", tovarController.deleteTovar);
tovarRouter.get("/", tovarController.getTovars);

module.exports = tovarRouter;
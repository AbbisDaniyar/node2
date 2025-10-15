const express = require("express");
const saleController = require("../Controllers/saleController.js");

const saleRouter = express.Router();

saleRouter.get("/addToCart/:TovarId", saleController.addToCart);
saleRouter.get("/getCart", saleController.getCart);
saleRouter.post("/cartToHistory", saleController.cartToHistory);
saleRouter.get("/getHistory/:ClientId", saleController.getHistory);

module.exports = saleRouter;
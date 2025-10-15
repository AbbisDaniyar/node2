const express = require("express");
const app = express();

app.set("view engine", "hbs");
const urlencodedParser = express.urlencoded({ extended: false });

// Подключение маршрутизаторов
const homeRouter = require("./Routes/homeRouter.js");
const tovarRouter = require("./Routes/tovarRouter.js");
const clientRouter = require("./Routes/clientRouter.js");
const saleRouter = require("./Routes/saleRouter.js");

app.use("/tovars", urlencodedParser, tovarRouter);
app.use("/clients", urlencodedParser, clientRouter);
app.use("/sales", urlencodedParser, saleRouter);
app.use("/", homeRouter);

// Обработка 404 ошибки
app.use(function (req, res, next) {
    res.status(404).send("Not Found");
});

// Запуск сервера
app.listen(3000, function () {
    console.log("🚀 Сервер запущен на http://localhost:3000");
    console.log("📁 Рабочая директория: " + process.cwd());
    console.log("✅ Приложение настроено по архитектуре MVC");
});
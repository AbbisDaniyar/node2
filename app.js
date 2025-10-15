// ==================== ИМПОРТ МОДУЛЕЙ ====================
const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const urlencodedParser = express.urlencoded({ extended: false }); 

// ==================== СОЗДАНИЕ ПРИЛОЖЕНИЯ ====================
const app = express();
const PORT = 3000;

// ==================== MIDDLEWARE ====================
// Парсинг URL-encoded данных (из форм)
app.use(express.urlencoded({ extended: false }));

// Парсинг JSON данных
app.use(express.json());

// Статические файлы (CSS, JS, изображения)
app.use(express.static(path.join(__dirname, "public")));

// ==================== НАСТРОЙКА ШАБЛОНИЗАТОРА ====================
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// ==================== ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ ====================
const pool = mysql.createPool({
    connectionLimit: 10, // Максимальное количество соединений
    host: "localhost",
    user: "root",
    password: "Daniyar", 
    database: "Comp",
    waitForConnections: true,
    queueLimit: 0
});

// Проверка подключения к базе данных
pool.getConnection((err, connection) => {
    if (err) {
        console.error("Ошибка подключения к базе данных:", err.message);
        return;
    }
    console.log("✅ Успешное подключение к базе данных MySQL");
    connection.release();
});

// ==================== БАЗОВЫЕ МАРШРУТЫ ================================

// Главная страница
app.get("/", (req, res) => {
    res.render("index", {
        title: "Главная страница",
        pageName: "Главная"
    });
});

// Страница "О нас"
app.get("/about", (req, res) => {
    res.render("about", {
        title: "О нашем салоне",
        pageName: "О нас"
    });
});

// Получение списка товаров с фильтрацией
app.get("/tovars", function (req, res) {
    // Основа SQL-запроса для таблицы Tovars
    let query = "SELECT * FROM Tovars";
    let filters = []; // Условие фильтрации
    let params = []; // Параметры SQL-запроса

    // Основа SQL-запроса для таблицы Firms
    let queryFirm = "SELECT * FROM Firms";
    let filtersFirm = []; // Условие фильтрации
    let paramsFirm = []; // Параметры SQL-запроса

    let firmId = req.query.firmId;
    let devId = req.query.devId;

    // Если выбран "Все типы устройств", устанавливаем devId в undefined
    if (devId == 0) devId = undefined;

    // Если выбран конкретный тип устройства DevId
    if (devId) {
        filters.push("DevId = ?"); // Условие фильтрации таблицы Tovars
        params.push(devId); // Параметры SQL-запроса

        filtersFirm.push("DevId = ?"); // Условие фильтрации таблицы Firms
        paramsFirm.push(devId); // Параметры SQL-запроса

        // Если выбран конкретный производитель FirmId
        if (firmId != 0 && firmId != undefined) {
            filters.push("FirmId = ?"); // Условие фильтрации таблицы Tovars
            params.push(firmId); // Параметры SQL-запроса
        }
    }

    // Формирование SQL-запроса для таблицы Tovars
    if (filters.length) {
        query += " WHERE " + filters.join(" AND ");
    }

    // Формирование SQL-запроса для таблицы Firms
    if (filtersFirm.length) {
        queryFirm += " WHERE " + filtersFirm.join(" AND ");
    }

    // Выполнение SQL-запроса для таблицы Devices
    pool.query("SELECT * FROM Devices", function (err, devices) {
        if (err) return console.log(err);

        // Выполнение SQL-запроса для таблицы Firms
        pool.query(queryFirm, paramsFirm, function (err, firms) {
            if (err) return console.log(err);

            // Выполнение SQL-запроса для таблицы Tovars
            pool.query(query, params, function (err, tovars) {
                if (err) return console.log(err);

                // Передача данных в представление
                res.render("Tovars.hbs", {
                    Devices: devices,
                    Firms: firms,
                    Tovars: tovars,
                    curDevId: devId,
                    curFirmId: firmId
                });
            });
        });
    });
});
app.post("/tovars/postAddTovar", urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    
    const { TovarId, TovarName, Price, Kol } = req.body;
    
    pool.query("INSERT INTO Tovars (TovarId, TovarName, Price, Kol) VALUES (?, ?, ?, ?)",
        [TovarId, TovarName, Price, Kol], function (err, data) {
            if (err) return console.log(err);
            res.redirect("/tovars");
        });
});

app.get("/tovars/editTovar/:TovarId", function (req, res) {
    const TovarId = req.params.TovarId;
    pool.query("SELECT * FROM Tovars WHERE TovarId=?", [TovarId], function (err, tovars) {
        if (err) return console.log(err);
        res.render("editTovar.hbs", {
            tovar: tovars[0]
        });
    });
});

app.post("/tovars/postEditTovar", urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    
    const { TovarId, TovarName, Price, Kol } = req.body;
    
    pool.query("UPDATE Tovars SET TovarName=?, Price=?, Kol=? WHERE TovarId=?",
        [TovarName, Price, Kol, TovarId], function (err, data) {
            if (err) return console.log(err);
            res.redirect("/tovars");
        });
});

app.post("/tovars/deleteTovar/:TovarId", function (req, res) {
    const TovarId = req.params.TovarId;
    pool.query("DELETE FROM Tovars WHERE TovarId=?", [TovarId], function (err, data) {
        if (err) return console.log(err);
        res.redirect("/tovars");
    });
});

// Обработка 404 ошибок
app.use((req, res) => {
    res.status(404).render("404", {
        title: "Страница не найдена",
        pageName: "404"
    });
});

// ==================== ЗАПУСК СЕРВЕРА ====================
app.listen(PORT, (error) => {
    if (error) {
        console.error("Ошибка запуска сервера:", error);
        return;
    }
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📁 Рабочая директория: ${__dirname}`);
});

// Экспорт для тестирования
module.exports = app;


const express = require("express");
const mysql = require("mysql2");

const app = express();
const urlencodedParser = express.urlencoded({ extended: false });

app.set("view engine", "hbs");

// Глобальная переменная для корзины
let cart = [];

// Подключение к базе данных
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
        console.log("❌ Ошибка подключения к базе данных:", err.message);
    } else {
        console.log("✅ Успешное подключение к базе данных MySQL");
        connection.release();
    }
});

// Главная страница
app.get("/", function (req, res) {
    res.render("Index.hbs");
});

// Страница "О нас"
app.get("/about", function (req, res) {
    res.render("About.hbs");
});

// Получение списка товаров с фильтрацией
app.get("/tovars", function (req, res) {
    let query = "SELECT * FROM Tovars";
    let filters = [];
    let params = [];

    let queryFirm = "SELECT * FROM Firms";
    let filtersFirm = [];
    let paramsFirm = [];

    let firmId = req.query.firmId;
    let devId = req.query.devId;

    if (devId == 0) devId = undefined;

    if (devId) {
        filters.push("DevId = ?");
        params.push(devId);

        filtersFirm.push("DevId = ?");
        paramsFirm.push(devId);

        if (firmId != 0 && firmId != undefined) {
            filters.push("FirmId = ?");
            params.push(firmId);
        }
    }

    if (filters.length) {
        query += " WHERE " + filters.join(" AND ");
    }

    if (filtersFirm.length) {
        queryFirm += " WHERE " + filtersFirm.join(" AND ");
    }

    // Сначала получаем Devices
    pool.query("SELECT * FROM Devices", function (err, devices) {
        if (err) return console.log(err);

        // Затем получаем Firms
        pool.query(queryFirm, paramsFirm, function (err, firms) {
            if (err) return console.log(err);

            // Затем получаем Tovars
            pool.query(query, params, function (err, tovars) {
                if (err) return console.log(err);

                res.render("Tovars.hbs", {
                    Devices: devices,
                    Firms: firms,
                    Tovars: tovars,
                    curDevId: devId,
                    curFirmId: firmId,
                    cartLen: cart.length
                });
            });
        });
    });
});

// Добавление товара в корзину
app.get("/sales/addToCart/:TovarId", function (req, res) {
    const TovarId = req.params.TovarId;
    
    pool.query("SELECT * FROM Tovars WHERE TovarId=?", [TovarId], function (err, tovar) {
        if (err) return console.log(err);
        
        if (tovar[0]) {
            cart.push(tovar[0]);
            console.log(`✅ Товар добавлен в корзину: ${tovar[0].TovarName}`);
        }
        
        res.redirect("/tovars");
    });
});

// Просмотр корзины
app.get("/sales/getCart", function (req, res) {
    const totalPrice = cart.reduce((total, tovar) => total + parseFloat(tovar.Price), 0);
    
    pool.query("SELECT * FROM Clients", function (err, clients) {
        if (err) return console.log(err);
        
        res.render("Cart.hbs", {
            cartTovars: cart,
            totalPrice: totalPrice,
            Clients: clients
        });
    });
});

// Оформление заказа
app.post("/sales/cartToHistory", urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    
    const clientId = req.body.clientId;
    const dateDay = new Date().getDate();
    const dateMonth = new Date().getMonth() + 1;
    
    if (clientId == 0) {
        return res.redirect("/sales/getCart");
    }
    
    if (cart.length === 0) {
        res.redirect("/tovars");
        return;
    }
    
    let completed = 0;
    cart.forEach(tovar => {
        pool.query("INSERT INTO History (TovarId, ClientId, dateDay, dateMonth) VALUES (?, ?, ?, ?)",
            [tovar.TovarId, clientId, dateDay, dateMonth], function (err) {
                if (err) console.log(err);
                
                completed++;
                if (completed === cart.length) {
                    console.log(`✅ Заказ оформлен для клиента ${clientId}`);
                    cart = [];
                    res.redirect("/tovars");
                }
            });
    });
});

// Просмотр истории покупок клиента
app.get("/sales/getHistory/:ClientId", function (req, res) {
    const clientId = req.params.ClientId;
    
    pool.query(`SELECT h.*, t.TovarName, c.ClientName 
                FROM History h 
                JOIN Tovars t ON h.TovarId = t.TovarId 
                JOIN Clients c ON h.ClientId = c.ClientId 
                WHERE h.ClientId=?`, 
                [clientId], function (err, history) {
        if (err) return console.log(err);
        
        res.render("History.hbs", {
            History: history
        });
    });
});

// Получение списка клиентов
app.get("/clients", function (req, res) {
    pool.query("SELECT * FROM Clients", function (err, clients) {
        if (err) return console.log(err);
        
        res.render("Clients.hbs", {
            Clients: clients
        });
    });
});

// Добавление нового клиента
app.get("/clients/addClient", function (req, res) {
    res.render("addClient.hbs");
});

app.post("/clients/postAddClient", urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    
    const ClientId = req.body.ClientId;
    const ClientName = req.body.ClientName;
    const BirthYear = req.body.BirthYear;
    const Address = req.body.Address;
    const Phone = req.body.Phone;
    
    pool.query("INSERT INTO Clients (ClientId, ClientName, BirthYear, Address, Phone) VALUES (?, ?, ?, ?, ?)",
        [ClientId, ClientName, BirthYear, Address, Phone], function (err) {
            if (err) return console.log(err);
            res.redirect("/clients");
        });
});

// Редактирование клиента
app.get("/clients/editClient/:ClientId", function (req, res) {
    const clientId = req.params.ClientId;
    
    pool.query("SELECT * FROM Clients WHERE ClientId=?", [clientId], function (err, clients) {
        if (err) return console.log(err);
        
        res.render("editClient.hbs", {
            client: clients[0]
        });
    });
});

app.post("/clients/postEditClient", urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    
    const ClientId = req.body.ClientId;
    const ClientName = req.body.ClientName;
    const BirthYear = req.body.BirthYear;
    const Address = req.body.Address;
    const Phone = req.body.Phone;
    
    pool.query("UPDATE Clients SET ClientName=?, BirthYear=?, Address=?, Phone=? WHERE ClientId=?",
        [ClientName, BirthYear, Address, Phone, ClientId], function (err) {
            if (err) return console.log(err);
            res.redirect("/clients");
        });
});

// Добавление товара
app.get("/tovars/addTovar", function (req, res) {
    res.render("addTovar.hbs");
});

app.post("/tovars/postAddTovar", urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    
    const TovarId = req.body.TovarId;
    const TovarName = req.body.TovarName;
    const Price = req.body.Price;
    const Kol = req.body.Kol;
    
    pool.query("INSERT INTO Tovars (TovarId, TovarName, Price, Kol) VALUES (?, ?, ?, ?)",
        [TovarId, TovarName, Price, Kol], function (err) {
            if (err) return console.log(err);
            res.redirect("/tovars");
        });
});

// Редактирование товара
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
    
    const Kol = req.body.Kol;
    const Price = req.body.Price;
    const TovarId = req.body.TovarId;
    
    pool.query("UPDATE Tovars SET Price=?, Kol=? WHERE TovarId=?",
        [Price, Kol, TovarId], function (err) {
            if (err) return console.log(err);
            res.redirect("/tovars");
        });
});

// Удаление товара
app.post("/tovars/deleteTovar/:TovarId", function (req, res) {
    const TovarId = req.params.TovarId;
    
    pool.query("DELETE FROM Tovars WHERE TovarId=?", [TovarId], function (err) {
        if (err) return console.log(err);
        res.redirect("/tovars");
    });
});

// Запуск сервера
app.listen(3000, function () {
    console.log("🚀 Сервер запущен на http://localhost:3000");
    console.log("📁 Рабочая директория: " + process.cwd());
});
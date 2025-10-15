const connectController = require("./connectController.js");
const pool = connectController.pool;

// Чтение таблицы Clients
exports.getClients = function (req, res) {
    pool.query("SELECT * FROM Clients", function (err, clients) {
        if (err) return console.log(err);

        res.render("Clients/Clients.hbs", {
            Clients: clients
        });
    });
};

// Добавление нового клиента
exports.addClient = function (req, res) {
    res.render("Clients/addClient.hbs");
};

exports.postAddClient = function (req, res) {
    if (!req.body) return res.sendStatus(400);

    const ClientId = req.body.ClientId;
    const ClientName = req.body.ClientName;
    const BirthYear = req.body.BirthYear;
    const Address = req.body.Address;
    const Phone = req.body.Phone;

    pool.query("INSERT INTO Clients (ClientId, ClientName, BirthYear, Address, Phone) VALUES (?, ?, ?, ?, ?)",
        [ClientId, ClientName, BirthYear, Address, Phone], function (err, client) {
            if (err) return console.log(err);
            res.redirect("/clients");
        });
};

// Редактирование клиента
exports.editClient = function (req, res) {
    const clientId = req.params.ClientId;

    pool.query("SELECT * FROM Clients WHERE ClientId=?", [clientId], function (err, clients) {
        if (err) return console.log(err);

        res.render("Clients/editClient.hbs", {
            client: clients[0]
        });
    });
};

exports.postEditClient = function (req, res) {
    if (!req.body) return res.sendStatus(400);

    const ClientId = req.body.ClientId;
    const ClientName = req.body.ClientName;
    const BirthYear = req.body.BirthYear;
    const Address = req.body.Address;
    const Phone = req.body.Phone;

    pool.query("UPDATE Clients SET ClientName=?, BirthYear=?, Address=?, Phone=? WHERE ClientId=?",
        [ClientName, BirthYear, Address, Phone, ClientId], function (err, client) {
            if (err) return console.log(err);
            res.redirect("/clients");
        });
};
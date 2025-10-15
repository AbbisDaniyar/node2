const connectController = require("./connectController.js");
const pool = connectController.pool;

// Чтение таблицы Tovars с фильтрацией
exports.getTovars = function (req, res) {
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

    pool.query("SELECT * FROM Devices", function (err, devices) {
        if (err) return console.log(err);

        pool.query(queryFirm, paramsFirm, function (err, firms) {
            if (err) return console.log(err);

            pool.query(query, params, function (err, tovars) {
                if (err) return console.log(err);

                let cartLen = connectController.cart.length;

                res.render("Tovars/Tovars.hbs", {
                    Devices: devices,
                    Firms: firms,
                    Tovars: tovars,
                    curDevId: devId,
                    curFirmId: firmId,
                    cartLen: cartLen
                });
            });
        });
    });
};

// Добавление нового товара
exports.addTovar = function (req, res) {
    res.render("Tovars/addTovar.hbs");
};

exports.postAddTovar = function (req, res) {
    if (!req.body) return res.sendStatus(400);

    const TovarId = req.body.TovarId;
    const TovarName = req.body.TovarName;
    const Price = req.body.Price;
    const Kol = req.body.Kol;

    pool.query("INSERT INTO Tovars (TovarId, TovarName, Price, Kol) VALUES (?, ?, ?, ?)",
        [TovarId, TovarName, Price, Kol], function (err, data) {
            if (err) return console.log(err);
            res.redirect("/tovars");
        });
};

// Редактирование товара
exports.editTovar = function (req, res) {
    const TovarId = req.params.TovarId;

    pool.query("SELECT * FROM Tovars WHERE TovarId=?", [TovarId], function (err, tovars) {
        if (err) return console.log(err);

        res.render("Tovars/editTovar.hbs", {
            tovar: tovars[0]
        });
    });
};

exports.postEditTovar = function (req, res) {
    if (!req.body) return res.sendStatus(400);

    const TovarId = req.body.TovarId;
    const Price = req.body.Price;
    const Kol = req.body.Kol;

    pool.query("UPDATE Tovars SET Price=?, Kol=? WHERE TovarId=?",
        [Price, Kol, TovarId], function (err, tovar) {
            if (err) return console.log(err);
            res.redirect("/tovars");
        });
};

// Удаление товара
exports.deleteTovar = function (req, res) {
    const TovarId = req.params.TovarId;

    pool.query("DELETE FROM Tovars WHERE TovarId=?", [TovarId], function (err, tovar) {
        if (err) return console.log(err);
        res.redirect("/tovars");
    });
};
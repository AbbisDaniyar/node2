const connectController = require("./connectController.js");
const pool = connectController.pool;

// Добавление товара в корзину
exports.addToCart = function (req, res) {
    const TovarId = req.params.TovarId;

    pool.query("SELECT * FROM Tovars WHERE TovarId=?", [TovarId], function (err, tovar) {
        if (err) return console.log(err);

        connectController.cart.push(tovar[0]);
        console.log(`✅ Товар добавлен в корзину: ${tovar[0].TovarName}`);
        res.redirect("/tovars");
    });
};

// Просмотр корзины
exports.getCart = function (req, res) {
    const totalPrice = connectController.cart.reduce((total, tovar) => total + parseFloat(tovar.Price), 0);

    pool.query("SELECT * FROM Clients", function (err, clients) {
        if (err) return console.log(err);

        res.render("Sales/Cart.hbs", {
            cartTovars: connectController.cart,
            totalPrice: totalPrice,
            Clients: clients
        });
    });
};

// Оформление заказа
exports.cartToHistory = function (req, res) {
    const clientId = req.body.clientId;
    const dateDay = new Date().getDate();
    const dateMonth = new Date().getMonth() + 1;

    if (clientId == 0) {
        return res.redirect("/sales/getCart");
    }

    if (connectController.cart.length === 0) {
        res.redirect("/tovars");
        return;
    }

    let completed = 0;
    connectController.cart.forEach(tovar => {
        pool.query("INSERT INTO History (TovarId, ClientId, dateDay, dateMonth) VALUES (?, ?, ?, ?)",
            [tovar.TovarId, clientId, dateDay, dateMonth], function (err) {
                if (err) console.log(err);

                completed++;
                if (completed === connectController.cart.length) {
                    console.log(`✅ Заказ оформлен для клиента ${clientId}`);
                    connectController.cart = [];
                    res.redirect("/tovars");
                }
            });
    });
};

// Просмотр истории покупок
exports.getHistory = function (req, res) {
    const clientId = req.params.ClientId;

    pool.query(`SELECT h.*, t.TovarName, c.ClientName 
                FROM History h 
                JOIN Tovars t ON h.TovarId = t.TovarId 
                JOIN Clients c ON h.ClientId = c.ClientId 
                WHERE h.ClientId=?`, 
                [clientId], function (err, history) {
        if (err) return console.log(err);

        res.render("Sales/History.hbs", {
            History: history
        });
    });
};
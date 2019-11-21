const express = require("express")
const bodyParser = require ("body-parser")
const engines = require ("consolidate")
const paypal = require ("paypal-rest-sdk")

const app = express ()

app.engine("ejs", engines.ejs)
app.set("views", "./views")
app.set("view engine", "ejs")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/// thanks to the paypal rest API, where I created a sandbox account
/// both business (merchant) and personal
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AWYv9VgIKzv6DztwCsJm7U4RE8cjeRI9QnxCie4P6YJOTM8r56QM826tVawaFzIU5MIvsf-SQBsrng8N',
    'client_secret': 'ECJElinKOrmxJCkj3m_5-cctkUxKYPScehQeV5cxs8Nj1-CtzMUaANUk2A8tEfbR_QI34WhCS6TCRgA0'
  });

app.get("/", (req, res) => {
    res.render("index")
})


app.get("/paypal", (req, res) => {
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "1.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "1.00"
            },
            "description": "This is the payment description."
        }]
    };
    
    /// redirect the user to payment.links, the url provided by paypal (collected from the console.log)
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            res.redirect(payment.links[1].href)
        }
    });
})

app.get("/success", (req, res) => {
//   res.send("Success") 
//   I get the paymentId and the payerId from the query parameters when "payment is a success"
var PayerID = req.query.PayerID
var paymentId = req.query.paymentId
var execute_payment_json = {
    "payer_id": PayerID,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "1.00"
        }
    }]
};

paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log("Get Payment Response");
        console.log(JSON.stringify(payment));
        res.render("success")
    }
}); 
})

app.get("cancel", (req, res) => {
    res.render("cancel")  
  })

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
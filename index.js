const express = require('express');
const CryptoJS = require('crypto-js')
const axios = require('axios')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json());


// Function to generate a unique transaction ID
function generatedTranscId() {
    return 'T' + Date.now();
}

app.get('/', (req, res) => {
    return res.status(200).json({
        message:'Backend is live'
    })
})

app.post("/payment", async (req, res) => {

    try {

        const price = parseFloat(100);
        // const { user_id, phone, name } = req.body;

        // Set the values to variables for later use
        const name = 'test';
        const email = 'test@gmail.com';
        const user = '234ksu';
        const phone = 7083363325;
        const tempId = '2318jdus9';
        
        const user_id = '823'

        const data = {
            merchantId: "PGTESTPAYUAT86",
            merchantTransactionId: generatedTranscId(),
            merchantUserId: 'MUID' + user_id,
            name: name,
            amount: price * 100,
            redirectUrl: `http://localhost:3001/api/v1/orders/status/${generatedTranscId()}`,
            redirectMode: "POST",
            mobileNumber: phone,
            paymentInstrument: {
                type: "PAY_PAGE",
            },
        };
        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString("base64");

        const key = "96434309-7796-489d-8924-ab56988a6076";
        const keyIndex = 1;
        const string = payloadMain + "/pg/v1/pay" + key;

        const sha256 = CryptoJS.SHA256(string).toString();
        const checksum = sha256 + "###" + keyIndex;

        const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
        const requestData = {
            method: "POST",
            url: prod_URL,
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                "X-VERIFY": checksum,
            },
            data: {
                request: payloadMain,
            },
        };

        axios.request(requestData)
            .then(async function (response) {
                const phonePeTransactionId = response.data.transactionId;
                res.status(201).send({
                    msg: "payment done",
                    status: "success",
                    data: response.data,
                    phonePeTransactionId: phonePeTransactionId,
                });
                console.log("Payment API Response:", response.data.message);
            })
            .catch(function (error) {
                console.error("Payment API Error:", error);
                res.status(500).json({ msg: "Payment Failed", status: "error", error: error.message });
            });

    }
     catch (e) {
        console.error("Internal Server Error:", e.message);
        res.status(500).json({ msg: "Internal Server Error", status: "error", error: e.message });
    }
});

const rideData = {
    "rollercoaster": { queueLength: 23, waitingTime: "39 mins" },
    "ferriswheel": { queueLength: 20, waitingTime: "15 mins" },
    "merrygoround": { queueLength: 35, waitingTime: "25 mins" },
};

app.get('/rideInfo', (req, res) => {
    const rideName = req.query.rideName;

    // Check if the ride name is provided
    if (!rideName) {
        return res.status(400).json({ msg: "Ride name is required", status: "error" });
    }

    // Look up ride information in the mock data
    const rideInfo = rideData[rideName.toLowerCase()];

    // Check if the ride exists in the data
    if (!rideInfo) {
        return res.status(404).json({ msg: "Ride not found", status: "error" });
    }

    // Respond with the queue length and waiting time for the requested ride
    res.status(200).json({
        status: "success",
        data: {
            rideName: rideName,
            queueLength: rideInfo.queueLength,
            waitingTime: rideInfo.waitingTime
        }
    });
});

function updateWaitingTime(rideName, newWaitingTime) {
    if (!rideData[rideName.toLowerCase()]) {
        throw new Error("Ride not found");
    }
    rideData[rideName.toLowerCase()].waitingTime = newWaitingTime;
}

app.patch('/rideInfo', (req, res) => {
    try {
        console.log('body',req.body)
        const rideName = req.body.rideName;
        const newWaitingTime = req.body.waitingTime;
        updateWaitingTime(rideName, newWaitingTime);
        res.status(200).json({
            status: "success",
            data: {
                rideName: rideName,
                queueLength: rideData[rideName.toLowerCase()].queueLength,
                waitingTime: newWaitingTime
            }
        });
    } catch (error) {
        res.status(404).json({ msg: error.message, status: "error" });
    }
});

app.listen(port, ()=> {
    console.log(`example running on port ${port}`)
})
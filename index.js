import express from 'express';
import { delay } from './util.js';
import {stocks} from './data/data.js';
import { getPriceSnapshot } from './data/prices.js';

const app = express();
const port = 8080;
const DEFAULT_REFRESH_RATE = 1000;

app.use(express.static('static'));

let refreshRate = DEFAULT_REFRESH_RATE;
app.use(express.static('static'));

app.get(`/refreshRate`, function(req, res) {
    res.json({refreshRate}); //get refreshRate: "DEFAULT_REFRESH_RATE"

});

app.put(`/refreshRate`, function(req,res){
    const rawRate = req.body?.refreshRate; //read refreshRate only if req.body exists
    const isValid = typeof rawRate === `number` || (typeof rawRate === `string` && rawRate.trim() !==''); //check if input is a number or string or blank 
    const newRate = isValid ? Number(rawRate): NaN; //if body is empty newRate = undefined -> ? : if else
    if (!Number.isFinite(newRate) || newRate < 50 || newRate > 5000){  // simply if it doesn't meet the criteria return the body is invalid
        return res.status(400).json({error: `Invalid request body`});
    }
    refreshRate = newRate;
    res.json({refreshRate});
});

app.delete('/refreshRate', function(req, res){
    refreshRate = DEFAULT_REFRESH_RATE; //set refreshRate back to default
    res.json({refreshRate});
});
// TODO: create GET, PUT, and DELETE /refreshRate endpoints per lab instructions

app.get('/data', (req, res) => {
    res.status(200).json(stocks);
});

app.get('/prices', (req, res) => {
    res.status(200).json(getPriceSnapshot());
});

const sseClientResponses = new Set();
let lastPriceSnapshot = getPriceSnapshot();
// TODO: Add a broadcastSSE() function that sends an SSE through all the sseClientResponses objects
function broadcastSSE(eventName, data){ //created broadcastSSE function with selected parameters
    const dataString = JSON.stringify(data);
    const message = `event: ${eventName}\ndata: ${dataString}\n\n`; //added new lines to divide eventname and datastring
    for (const response of sseClientResponses) { // Send the event to every client with an open stream.
        response.write(message);
    }
}
// TODO: Add broadcastPriceUpdates() to broadcast price updates per lab instructions
async function broadcastPriceUpdates() {
    while (true) { 
        await delay(refreshRate); //wait using the server's current refresh rate before checking prices again.
        const currentSnapshot = getPriceSnapshot();
        const updates = []; 
        for (const [stock, value] of Object.entries(currentSnapshot)) { //compare each stocks current price with its previous price.
            if (lastPriceSnapshot[stock] !== value) {
                updates.push({ stock, value });
            }
        }

        //save this snapshot so the next check can detect new changes.
        lastPriceSnapshot = currentSnapshot;

        //send a price-update event only when at least one price changed.
        if (updates.length > 0) {
            broadcastSSE('price-update', updates);
        }
    }
}

// TODO: Add a GET /prices/stream endpoint that sets up SSEs for price updates per lab instructions
app.get('/prices/stream', function(req,res){ //created GET for selected items from readme
    res.set({
        'Content-Type': 'text/event-stream', 
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

res.flushHeaders(); //send headers to browser (copy paste from readme)
sseClientResponses.add(res); //keep response so broadcast can write updates (also just a copy paste from readme)
req.on('close', function () { //get rid of the garbage (disconnected clients)
        sseClientResponses.delete(res);
    });
});

app.get('/error', (req, res) => {
    res.status(500).json({error: "oh noooo"});
});

app.use((_, res) => {
    // For our last middleware, if we got here, we didn't find the file, return a 404
    res.status(404).send('Not Found');
});


app.listen(port, (error) => {
    if (!error) {
        console.log(`listening on http://localhost:${port}`);
    } else {
        console.error(error);
    }
});

broadcastPriceUpdates();

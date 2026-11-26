import express from 'express';
import { delay } from './util.js';
import {stocks} from './data/data.js';
import { getPriceSnapshot } from './data/prices.js';

const app = express();
const port = 8080;
const DEFAULT_REFRESH_RATE = 1000;

app.use(express.static('static'));

let refreshRate = DEFAULT_REFRESH_RATE;

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

// TODO: Add broadcastPriceUpdates() to broadcast price updates per lab instructions

// TODO: Add a GET /prices/stream endpoint that sets up SSEs for price updates per lab instructions

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

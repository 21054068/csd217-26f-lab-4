import { delay } from '../util.js';
import { stocks } from './data.js';

function getInitialPrices(stocks) {
    const prices = {};
    stocks.forEach( s => {
        prices[s.symbol] = +(20 + Math.random() * 200).toFixed(2);   
    }); 
    return prices;
}
const prices = getInitialPrices(stocks);


/**
 * @returns A snapshot of the current prices
 */
export function getPriceSnapshot() {
    return {...prices};
}

/**
 * Simulates stock market changes by generating a new price update for a random stock at random-length intervals
 * @param {*} initialPrices The initial prices
 */
async function* generateStockUpdates(initialPrices) {

    const internalPrices = {...initialPrices}
    while (true) {
        let symbolObj = stocks[Math.floor(Math.random()*stocks.length)];
        const symbol = symbolObj.symbol;
        const changePct = (Math.random() * 2 - 1) * 0.01; // change the value by some small amount
        const newPrice = +(internalPrices[symbol] * (1 + changePct)).toFixed(2);  // toFixed returns a string, 
                                                                            // + causes it to be coerced back into a number
        internalPrices[symbol] = newPrice;
        yield { stock: symbol, value: newPrice };

        // Wait a random length of time for the next update
        await delay(Math.floor(Math.random()*100)+10);
    }
}

/**
 * Kick off the simulation of stock market updates
 */
async function startPriceUpdates() {
    for await ( let update of generateStockUpdates(prices) ) {
        prices[update.stock] = update.value;
    }
}
// Start the price updates on module import
startPriceUpdates();
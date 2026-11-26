# HTTP, TCP & TLS in JavaScript & Node.js

## Setup

1. Click the 'Use this template' button near the top right of this repo.
2. Create a new PRIVATE repo under YOUR GitHub account with the name csd217-26f-lab-4
3. Add your instructor as a collaborator in your repo
4. Clone that repo to your dev machine (either your own machine or a Codespace)
5. Switch to a branch named lab-4

## Assignment Objectives

Continue developing your stock ticker application.

In the previous lab, you moved the simulation of stock updates into a proper web server and used polling to obtain price snapshots that were compared with a previous snapshot to determine which stocks to update in the client. This snapshot comparison occurred at a refresh rate determined by the user on the client side.

In this lab, you will...

- Use GET, PUT, and DELETE requests to manage the refresh rate server-side.
- Use Server-Sent Events (SSEs) instead of polling to do the stock updates.

## Running the App

Make sure dependencies are installed with `npm install`.

Run the app server using `npm run serve` and browsing to the URL displayed once the server is running.

## Part A - Server-side refresh rate management

Currently, the server updates stock prices at a random-length interval and the client retrieves snapshots of the entire set of prices by polling at a fixed refresh rate. Since the server will be sending price updates directly, you need to change the code so that the client-side refresh rate is ALSO managed server-side.  To do so, you will need to track a refresh rate on the server and expose HTTP endpoints that allow clients to retrieve, update, and reset the refresh rate. You will then use these endpoints to manage the refresh rate `<input>` in the client code.

1. Add the route `GET /refreshRate` to the server; it should respond with `{ refreshRate: # }` (with # replaced with the current refresh rate).
2. Add the route `PUT /refreshRate` to the server; it should update the server-side refresh rate based on a JSON payload of form `{ refreshRate: # }`, and on success respond with `{ refreshRate: # }` (again, with # replaced with the actual refresh rate).
    1. Add the appropriate [body parser middleware](https://expressjs.com/en/5x/api/express/#expressjson) to the server so that you can parse the JSON data in the body of the request.
    2. You must validate the request data (`req.body?.refreshRate`): make sure the data is present and is a number between 50 and 5000 (string equivalents should be accepted)
    3. If the data is invalid, respond with an appropriate [HTTP status code](https://expressjs.com/en/5x/api/response/#resstatus) and a JSON body of the form `{ error: "Invalid request body" }`
3. Add the route `DELETE /refreshRate` to the server; it should reset the refresh rate to the default (see `index.js:DEFAULT_REFRESH_RATE`) and respond with `{ refreshRate: # }` (with # replaced with the current refresh rate)
4. Now in the client, index.html:
     1. Initialize the `refreshRate` variable by fetching the `GET /refreshRate` endpoint and using the response data.
     2. Update `tryFetchData` so that it accepts a second `options` argument (default `{}`).  Forward this argument as the second argument of the `fetch` call.
     2. Update the `validateInput` function so that it uses the `PUT /refreshRate` endpoint to update the refresh rate server-side. You will need to make sure you set appropriate headers and body to match what the server expects (see the `PUT` endpoint above).
     3. Add a Reset button that uses the `DELETE /refreshRate` endpoint to reset the refresh rate. The refresh rate `<input>` value must be updated according to the value in the response.
5. **OBSERVE**: You should be able to use the refresh rate input as before to control the refresh rate of your stock tickers, but now you should see requests being made in the browser Devtools when you update or reset the refresh rate.
6. **DELIVERABLE**: Take a screenshot showing each of the GET, PUT, and DELETE `/refreshRate` endpoints being requested at least once in your browser Devtools. Add the screenshot to this repository.

## Part B - Server-sent events instead of polling

Now that the server knows how often the client wants to refresh the stock prices, you need to change the server code to send ONLY the updated prices from one update to the next.  You will use a similar strategy as last lab: keep a snapshot of the previous prices for comparison.  But this time the comparison is happening server-side, and the client receives ONLY the updated stock prices.

1. In `index.js`, create a `GET /prices/stream` endpoint that sets up Server-Sent Events by...
    1. Setting the following headers on the response:
        - `Content-Type: text/event-stream`
        - `Cache-Control: no-cache`
        - `Connection: keep-alive`
    2. Calling `flushHeaders()` on the response
    3. Adding the response to the `sseClientResponses` set that is already declared in `index.js`
    4. Adding a `close` event handler on the **REQUEST** so that if the request closes the response is removed from the `sseClientResponses` set.
2. In `index.js`, create a `broadcastSSE(eventName, data)` function that...
    1. Stringifies the given JSON data
    2. Correctly forms the SSE message string (note the important extra empty line at the end!):
         ```
         event: <event name>
         data: <data string>
                                   <-- empty line to indicate end of message
         ```
    3. Uses the `write()` method on each of the `sseClientResponses` objects to send the SSE to each of the connected clients. 
3. In `index.js`, create a `broadcastPriceUpdates()` function that does the following **in an infinite (`while (true)`) loop**:
    1. Waits for `refreshRate` ms (using the `util.js:delay(ms)` function; don't forget that `delay` is Promise-based! You will need to `await` it!)
    2. Takes a new snapshot of current prices, and creates a list of `{ stock: <stock symbol>, value: <new price> }` items for stock prices that have changed since the previous snapshot (see the `lastPriceSnapshot` variable that is already declared in `index.js`)
    3. Don't forget to replace the previous snapshot with the new snapshot once you've recorded the price updates.
    3. **ONLY** if there are changed prices since the last update: use the `broadcastSSE(eventName, data)` function to send an SSE named `price-update` to all connected clients. The data of the SSE can simply be the list of changed prices.
4. You will need to call `broadcastPriceUpdates()` (WITHOUT awaiting it) in order to kick off constant broadcasting of price updates.
5. Now, in `index.html` (NOT `index.js`)...
    1. In the `updating` branch of the `toggleUpdates` function, **replace** the call to `updatePrices` with code that 
        1. Creates a new EventSource on the `/prices/stream` endpoint you created above
        2. Listens for `price-update` events on that EventSource
        3. Dispatches a `stock-update` CustomEvent for each price in the `price-update` SSE. (See the existing code in `updatePrices`; you are now effectively getting ONLY the updated prices from the server, and you are forwarding this information to your Lit components as usual.)
    2. In the 'not updating' branch, call the `close` method on the EventSource object.
    3. Remove the following functions that are no longer necessary: `updatePrices`, `delay`.
    4. **OBSERVE**: Your app should be working as before, but SSEs are used instead of polling to detect price updates. You should be able to view these updates in your browser Devtools.
    5. **DELIVERABLE**: Take a screenshot showing several `price-update` events arriving in your browser Devtools and add it to this repository.

## Part C - Reflection

Answer each of the questions in the `Reflection.md` document.

## Rubric

Your grade will be capped by the following limits:

- MAX 75% : incorrect lab setup / submission

Your grade will be determined by the following criteria (and the above limits):

| Criteria | Points | Description |
|---------|----------|-----------|
| `/refreshRate` endpoints | 15 | Server contains correctly implemented `GET`, `PUT`, and `DELETE` `/refreshRate` endpoints |
| Client uses `/refreshRate` | 5 | Client uses the `/refreshRate` endpoints to manage refresh rate |
| SSEs for price updates | 30 | Server exposes an SSE event source at `GET /prices/stream` that produces price update messages at the refresh rate interval |
| Client consumes SSEs | 20 | Client uses the `/prices/stream` endpoint as an `EventSource` for price updates |
| Reflections | 30 | Thorough, correct, and non-AI-generated responses to reflection questions |

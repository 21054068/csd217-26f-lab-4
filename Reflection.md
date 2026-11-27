# Reflections

---

## Answers to Reflection Questions

1. Why is it important to validate data like that in the `PUT /refreshRate` endpoint on the server even though it is validated on the client?
Valdiation gives the user quicker feedback, however it can be bypassed by sending a request straight to PUT /refresh. So the server needs to check the value before saving it because the broadcast loop needs that value to know how long to wait between checks. If the value is missing or invalid or just outside of the acceptable range it will return error 404 and keep running like nothing happened.

2. Why is `PUT` a good choice of method vs `POST` or `PATCH` for updating the refresh rate?
PUT works because the request replaces the entire refreshRate setting with a specific value. Patch is normally used to change a part of a setting but this script only has one setting. And for POST it could be used to update an action but PUT implements it more directly.

3. What would happen if multiple clients use the `PUT /refreshRate` endpoint? Why? (As a thought exercise not worth any marks: how could the design be improved to make individual clients able to manage their own refresh rates while all using the same server?)
Since PUT is replacing the existing value if one person entered 500 and another entered 4999 right after the value would be 4999. For the though experiment maybe a different refresh rate for each client? Possibly create a array storing each clients refreshrate and assign to IP? Maybe?

4. Explain the purpose of each of the headers in the `/prices/stream` SSE responses
Content-Type: text/event-stream	Tells the browser to interpret the response as a stream of server-sent events.
Cache-Control: no-cache	Tells caches to revalidate a stored response before reusing it, so a stale response isn’t treated as the live stream.
Connection: keep-alive	Signals that the HTTP/1.1 connection should stay open. The server leaves the response open so it can write more events as prices change.

5. Explain in detail what happens when the user clicks the 'Toggle Updates' button once to turn updates on, then again to turn them off. Be sure to explain both the creation and closing of the EventSource, and the generation of `price-update` events.
On the first click toggleUpdates() sets updating to true. That turns the indicator green and creates an EventSource for /prices/stream. That would then send a GET request. The server in response will send and flush the SSE headers and leave the response open and adds it to sseClientResponses. The servers broadcast loop is already running at this point and after each delay(refreshRate) it'll take a new price snapshot and compare it to the previous price then saves it for the next snapshot. If at least one price changed it sends a price-update event. The browsers price-update listener parses event.data from JSON. For each {stock, value} item it will dispatch a stock-update on document so the Lit component can update. on the second click it sets updating to false which will then turn the indicator red and call updateEvents.close() and remove sseClientResponse.

6. Why is SSE a good choice over WebSockets for the stock updates in this application?
Stock updates move in one direction from the server to the browser. Since the browser already uses an oridnary HTTP request to get put and delete the refresh rate setting SSE gives the browser a easy way to recieve named events with automatic reconnection if it ever drops.
---

## Learnings
Make a lot more informational comments as I learned from when we took the midterm I described nothing in my code at all so I have tried to describe what each of the lines I wrote did and in some places how they interact with others!
## Frustrations
I cannot seem to get a screenshot of the Put and delete. The issue is for sure with my code but I am unsure as to where.
after prompting chatgpt with my written code with the existing code above it included asking why I am unable to see my put and deletes in google chromes dev tools
It pointed me towards the static/index.hmtl and showed me I forgot to change anything in there at all. After reconfiguring the and completing the lab as the readme instructed for part A it worked perfectly.

when adding the button I came across an error where no matter what if I stop/started or did anything really it would reset the refresh rate to 1000 and only preform GET requests: This again took me far to long to realize I had forgotten to include options as an option which was literally commented above it
 async function tryFetchData(path, options <- > = {}) {
      try {
        let response = await fetch(path, options <- >);


## Observations

---

# AI Statement

I did use AI 
I used ChatGPT to break down the lab and understand how the browser and server work together. In Part A, we discussed why the server stores and validates the refresh rate, how GET, PUT, and DELETE each handle the setting, and how the browser uses the returned value to update the input. We also used DevTools to troubleshoot why changing the input sent a GET instead of a PUT.

In Part B, we discussed how Server-Sent Events replace polling. The server compares price snapshots, sends only changed prices, and removes disconnected clients from its list. We walked through how the Toggle Updates button opens and closes the stream and how incoming events reach the stock ticker components. We also reviewed why SSE fits one-way stock updates and what to capture in DevTools for both parts.

ChatGPT provided implementation examples, suggested comments, and reflection.

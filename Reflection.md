# Reflections

---

## Answers to Reflection Questions

1. Why is it important to validate data like that in the `PUT /refreshRate` endpoint on the server even though it is validated on the client?

2. Why is `PUT` a good choice of method vs `POST` or `PATCH` for updating the refresh rate?

3. What would happen if multiple clients use the `PUT /refreshRate` endpoint? Why? (As a thought exercise not worth any marks: how could the design be improved to make individual clients able to manage their own refresh rates while all using the same server?)

4. Explain the purpose of each of the headers in the `/prices/stream` SSE responses

5. Explain in detail what happens when the user clicks the 'Toggle Updates' button once to turn updates on, then again to turn them off. Be sure to explain both the creation and closing of the EventSource, and the generation of `price-update` events.

6. Why is SSE a good choice over WebSockets for the stock updates in this application?

---

## Learnings

## Frustrations

## Observations

---

# AI Statement

- I did not use any AI

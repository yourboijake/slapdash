# slapdash
A simple, self-hosted slack clone with as few external dependencies as possible


#### Todo list
- basic HTTP web server: done
- main HTML page
    - send chats back to server, store with in-memory datastore of chat history
    - some kind of basic user model, starting with a configurable username textbox field
- expand to websockets
    - configure a new server to create and maintain websocket connections
    - live update webpage with new chats
- backed configuration:
    - implement a user class
    - implement a chat class
    - implement a room class (chatroom)
- authentication
- concurrency
- make the UI not terrible
Omegle clone based on webRTC protocol.

Frontend makes websocket connection
once we add user on backend a room is created which triggers send-offer event to respective frontend of users and we have event listner present here.

websocket connection is formed between frontend and backend from frontend using backend URL
after that following events occurs in respective order
send-offer (backend->frontend)
offer(frontend->backend)
offer(backend -> frontend)
answer(frontend -> backend)
answer( backend -> frontend)

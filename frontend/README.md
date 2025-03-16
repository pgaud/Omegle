    Add this scripts in package.json 
    "start": "react-scripts start",
    "build": "react-scripts build",
    "dev": "npm run build && npm run start"
    
    run npm run dev to build and start the project.

    Websocket flow -
    websocket connection is formed between frontend and backend from frontend using backend URL

    after that following events occurs in respective order
    send-offer (backend->frontend)
    offer(frontend->backend)
    offer(backend -> frontend)
    answer(frontend -> backend)
    answer( backend -> frontend)

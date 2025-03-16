Add This script in package.json

  "scripts": {
    "build": "npx tsc -b",
    "start": "node dist/index.js",
    "dev": "npm run build && npm run start"
  },

  run npm run dev to run the backend.
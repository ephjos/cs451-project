import WebServer from './src/WebServer';

// In production, these should be in .env, but that's not important
// for getting this working for class.
const MONGO_URI = "mongodb+srv://admin:password1234@cluster0-2yj6d.mongodb.net/clients?retryWrites=true&w=majority"
const MONGO_SECRET = "GameSession"

const server = new WebServer(MONGO_URI, MONGO_SECRET, process.env.PORT)
server.start()

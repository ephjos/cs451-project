import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as mongoose from 'mongoose';

require('dotenv').config()

const MongoStore = require('connect-mongo')(session);

mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
}).then(() => { console.log("DB Connected") })
  .catch(() => { console.log("Could not connected to DB") });

const db = mongoose.connection
const app = express();
const port = process.env.PORT || '8080';

app.set('port', port);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/api', function (req, res) {
  res.send('This is an api')
});

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.MONGO_SECRET,
  cookie: { maxAge: 60000 },
  store: new MongoStore({ mongooseConnection: db })
}));

app.listen(app.get('port'), (): void => {
  console.log(`Server running on port ${app.get('port')}`);
});

export default app;

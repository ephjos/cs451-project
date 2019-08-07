import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as mongoose from 'mongoose' ;
const MongoStore = require('connect-mongo')(session);

mongoose.connect('mongodb://localhost:8080/my-database', {
  useNewUrlParser: true
});

const db = mongoose.connection
const app = express();
const port = process.env.PORT || '8080';

app.set('port', port)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('.'));

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'GameSession',
  cookie: { maxAge: 60000 },
  store: new MongoStore({ mongooseConnection: db })
}));


app.get('/api', function (req, res) {
  res.send('This is an api')
});


app.listen(app.get('port'), (): void => {
  console.log(`Server running on port ${app.get('port')}`);
});

export default app;
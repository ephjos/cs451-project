import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as mongoose from 'mongoose' ;


// const MongoStore = require('connect-mongo')(session);

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
  cookie: { maxAge: 60000 }}));

app.get('/', function (req, res) {
  res.send('Server is up')
})


app.listen(app.get('port'), (): void => {
  console.log(`Server running on port ${app.get('port')}`);
});

export default app;
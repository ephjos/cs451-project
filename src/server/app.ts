import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
const MongoStore = require('connect-mongo')(session);

// In production, these should be in .env, but that's not important
// for getting this working for class.
const MONGO_URI = "mongodb+srv://admin:password1234@cluster0-2yj6d.mongodb.net/clients?retryWrites=true&w=majority"
const MONGO_SECRET = "GameSession"

const store = new MongoStore({ url: MONGO_URI })

store.all().then((a: any) => console.log(a))

const AGE = 60000 * 5 // 5 minutes

const app = express();
const port = process.env.PORT || '8080';

app.set('port', port);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: MONGO_SECRET,
  cookie: { maxAge: AGE },
  store
}));

app.get('/api', function (req, res) {
  res.send('This is an api')
  // TODO
  // USE THIS ID
  // REFERENCE THE DOCS
  // MAKE CLASSES
  console.log(req.session.id)
});

store.on('connected', () => {
  console.log('DB Connected')

  app.listen(app.get('port'), (): void => {
    console.log(`Server running on port ${app.get('port')}`);
  });
})

export default app;

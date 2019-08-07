import * as express from 'express'
import * as path from 'path'
//x import * as fs from "fs";
//x import * as favicon from 'serve-favicon';
//x import * as logger from 'morgan';
//x import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser'
import * as session from 'express-session'

const port = process.env.PORT || '5000'
const app = express()

// view engine setup
//x app.set('views', path.join(__dirname, 'views'));
//x app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));

//x app.use(logger('dev'));
//x app.use(cookieParser());

app.set('port', port)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('.'))
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: 'SOMERANDOMSECRETHERE',
    cookie: { maxAge: 60000 },
  }),
)
app.use(express.static(path.join(__dirname, 'public')))

app.listen(
  app.get('port'),
  (): void => {
    console.log(`Server running on port ${app.get('port')}`)
  },
)

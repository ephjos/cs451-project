import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
const MongoStore = require('connect-mongo')(session);
const TTL = 60000 * 5 // 5 minutes

import MatchMaker from './MatchMaker'

class WebServer {
    private _store: any; // No types for connect-mongoS
    private _url: string;
    public mm: MatchMaker

    public app: any; // No type for Express

    constructor(mongo_url: string, mongo_secret: string, port: string = '8080') {
        this._url = mongo_url;

        this.mm = new MatchMaker()
        this.app = this._configureApp(mongo_secret, port);
    }

    private _configureApp(secret: string, port: string) {
        let app = express();
        app.set('port', port);

        app.use(express.static('public'));
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());

        app.use(session({
            resave: true,
            saveUninitialized: true,
            secret: secret,
            cookie: { maxAge: TTL },
            store: this._store
        }));

        app = this._configureEndpoints(app)

        return app
    }

    private _configureEndpoints(app: any) {
        // GET
        app.get('/connect', function (this: any, req: any, res: any) { // TODO: Resolve POST in docs
            this.mm.addToQueue(req.session.id, () => {
                res.send(`Opponent found! Your ID is: ${req.session.id}`)
            })
        }.bind(this));

        app.get('/status', function (req: any, res: any) {
            res.send(`You\'ve hit /status! ID: ${req.session.id}`)
        });

        // POST
        app.post('/move', function (req: any, res: any) {
            res.send(`You\'ve hit /move! ID: ${req.session.id}`)
        });

        app.post('/end', function (req: any, res: any) {
            res.send(`You\'ve hit /end! ID: ${req.session.id}`)
        });

        app.post('/disconnect', function (req: any, res: any) {
            res.send(`You\'ve hit /disconnect! ID: ${req.session.id}`)
        });

        return app
    }


    public start() {
        this._store = new MongoStore({ url: this._url })

        this._store.on('connected', () => {
            console.log('DB Connected')
            this.app.listen(this.app.get('port'), (): void => {
                console.log(`Server running on port ${this.app.get('port')}`);
            });

        })
    }

    // TODO: remove this
    public printAll() {
        this._store.all().then((a: any) => console.log(a))
    }
}

export default WebServer;
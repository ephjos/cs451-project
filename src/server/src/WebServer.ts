import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
const MongoStore = require('connect-mongo')(session);
const TTL = 60000 * 5 // 5 minutes

import MatchMaker from './MatchMaker'
import { Status } from '../../client/src/classes/Game'

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
        app.get('/connect', function (this: any, req: any, res: any) {
            this.mm.addToQueue(req.session.id, (currentTurn?: boolean) => {
                res.statusCode = 200
                res.send({ msg: 'Opponent found!', currentTurn })
            })
        }.bind(this));

        app.get('/status', function (this: any, req: any, res: any) {
            let [status, board] = this.mm.getStatus(req.session.id)
            if (status != Status.ERROR) {
                res.statusCode = 200
                res.send({
                    status: status,
                    board: board
                })
            } else {
                res.statusCode = 403
                res.send({ msg: 'Client is not currently in a game or queue' })
            }
        }.bind(this));

        // POST
        app.post('/move', function (this: any, req: any, res: any) {
            if (req.body && req.body.board) {
                let status = this.mm.updateBoard(req.session.id, req.body.board)
                if (status != Status.ERROR) {
                    res.statusCode = 200
                    res.send({ status })
                } else {
                    res.statusCode = 403
                    res.send({ msg: 'Client is not currently in game' })
                }
            } else {
                res.statusCode = 400
                res.send({ msg: 'Request body must be of the form { board: \'...\' }' })
            }
        }.bind(this));

        app.post('/end', function (this: any, req: any, res: any) {
            let status = this.mm.endGame(req.session.id)

            if (status != Status.ERROR) {
                res.statusCode = 200
                res.send({ status: status })
            } else {
                res.statusCode = 403
                res.send({ msg: 'Client is not currently in game' })
            }
        }.bind(this));

        app.post('/disconnect', function (this: any, req: any, res: any) {
            let status = this.mm.forfeit(req.session.id)

            if (status != Status.ERROR) {
                res.statusCode = 200
                res.send({ status: status })
            } else {
                res.statusCode = 403
                res.send({ msg: 'Client is not currently in game' })
            }
        }.bind(this));

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
}

export default WebServer;
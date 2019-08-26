import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import cors = require('cors');
import connectMongo = require('connect-mongo');
const MongoStore = connectMongo(session);
const TTL = 60000 * 20; // 10 minutes

import MatchMaker from './MatchMaker';
import { Status } from '../../client/src/classes/Game';

class WebServer {
  private _store: connectMongo.MongoStore;
  private _url: string;
  public mm: MatchMaker;

  public app: express.Application;

  constructor(mongoUrl: string, mongoSecret: string, port: string = '5000') {
    this._url = mongoUrl;

    this.mm = new MatchMaker();
    this.app = this._configureApp(mongoSecret, port);
  }

  private _configureApp(secret: string, port: string): express.Application {
    let app: express.Application = express();
    app.set('port', port);

    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

    app.use(session({
      resave: true,
      saveUninitialized: true,
      secret: secret,
      cookie: { maxAge: TTL },
      store: this._store
    }));

    app = this._configureEndpoints(app);

    return app;
  }

  private _configureEndpoints(app: express.Application): express.Application {
    // GET
    app.get('/connect', (req: express.Request, res: express.Response): void => {
      console.log(`Received /connect request from Client with ID: ${req.session.id}`);
      this.mm.addToQueue(req.session.id).then((currentTurn?: boolean): void => {
        res.statusCode = 200;
        res.send({ msg: 'Opponent found!', currentTurn });
        console.log(`Found game for Client with ID: ${req.session.id}`);
      });
    });

    app.get('/status', (req: express.Request, res: express.Response): void => {
      console.log(`Received /status request from Client with ID: ${req.session.id}`);
      let [status,] = this.mm.getStatus(req.session.id);
      if (status !== Status.ERROR) {
        res.statusCode = 200;
        res.send({
          status: status,
        });
      } else {
        console.log(`Bad status request from ${req.session.id}, status: ${status}`);
        res.statusCode = 403;
        res.send({ msg: 'Client is not currently in a game or queue' });
      }
    });

    // POST
    app.post('/sendMoves', (req: express.Request, res: express.Response): void => {
      if (req.session.id && req.body && req.body.moves) {
        console.log(`Received /sendMoves request from Client with ID: ${req.session.id}`);
        let status = this.mm.updateMoves(req.session.id, req.body.moves);
        if (status !== Status.ERROR) {
          res.statusCode = 200;
          res.send({ status });
        } else {
          res.statusCode = 403;
          res.send({ msg: 'Client is not currently in game' });
        }
      } else {
        res.statusCode = 400;
        res.send({ msg: 'Request body must be of the form { moves: \'...\' }' });
      }
    });

    app.get('/receiveMoves', (req: express.Request, res: express.Response): void => {
      if(!req.session.id) {
        res.statusCode = 403;
        res.send({ msg: 'Client is not currently in game' });
      } else {
        console.log(`Received /receiveMoves request from Client with ID: ${req.session.id}`);
        this.mm.waitForMoves(req.session.id).then((response: [Status, string[][]]): void => {
          res.send({ status: response[0], newMoves: response[1] });
        });
      }
    });

    app.get('/end', (req: express.Request, res: express.Response): void => {
      console.log(`Received /end request from Client with ID: ${req.session.id}`);
      let status = this.mm.endGame(req.session.id);
      if (status !== Status.ERROR) {
        res.statusCode = 200;
        res.send({ status: status });
      } else {
        res.statusCode = 403;
        res.send({ msg: 'Client is not currently in game' });
      }
    });

    app.get('/disconnect', (req: express.Request, res: express.Response): void => {
      console.log(`Received /disconnect request from Client with ID: ${req.session.id}`);
      let status = this.mm.forfeit(req.session.id);

      if (status !== Status.ERROR) {
        res.statusCode = 200;
        res.send({ status: status });
      } else {
        res.statusCode = 403;
        res.send({ msg: 'Client is not currently in game' });
      }
    });

    return app;
  }


  public start(): void {
    this._store = new MongoStore({ url: this._url });

    this._store.on('connected', (): void => {
      console.log('DB Connected');
      this.app.listen(this.app.get('port'), (): void => {
        console.log(`Server running on port ${this.app.get('port')}`);
      });
    });
  }
}

export default WebServer;
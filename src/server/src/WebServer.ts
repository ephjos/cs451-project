import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import cors = require('cors');
import connectMongo = require('connect-mongo');
const MongoStore = connectMongo(session);
const TTL = 60000 * 5; // 5 minutes

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
    app.use(cors({origin: '*'}));

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
      this.mm.addToQueue(req.session.id).then((currentTurn?: boolean): void => {
        res.statusCode = 200;
        res.send({ msg: 'Opponent found!', currentTurn });
      });
    });

    app.get('/status', (req: express.Request, res: express.Response): void => {
      let [status, board] = this.mm.getStatus(req.session.id);
      if (status !== Status.ERROR) {
        res.statusCode = 200;
        res.send({
          status: status,
          board: board
        });
      } else {
        res.statusCode = 403;
        res.send({ msg: 'Client is not currently in a game or queue' });
      }
    });

    // POST
    app.post('/move', (req: express.Request, res: express.Response): void => {
      if (req.body && req.body.board) {
        let status = this.mm.updateBoard(req.session.id, req.body.board);
        if (status !== Status.ERROR) {
          res.statusCode = 200;
          res.send({ status });
        } else {
          res.statusCode = 403;
          res.send({ msg: 'Client is not currently in game' });
        }
      } else {
        res.statusCode = 400;
        res.send({ msg: 'Request body must be of the form { board: \'...\' }' });
      }
    });

    app.post('/end', (req: express.Request, res: express.Response): void => {
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
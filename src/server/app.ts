import * as express from 'express';
import * as bodyParser from 'body-parser';

const port = process.env.PORT || '5000';
const app = express();
app.set('port', port)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))
  .use(express.static('.'));

app.listen(app.get('port'), (): void => {
  console.log(`Server running on port ${app.get('port')}`);
});
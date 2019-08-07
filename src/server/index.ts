import app from './app';

app.get('/', function (req, res) {
  res.render('index', { title: 'Express server' });
});
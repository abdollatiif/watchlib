var mysql      = require('mysql');

var connection = mysql.createConnection({
  	host     : 'ism.ma',
  	database : 'ismma_watchlib',
  	user     : 'ismma_ism',
  	password : 'saidisaidi1174'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
  
});

exports.conn = connection;
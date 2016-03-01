/**
 * Created by jcy on 15/8/26.
 */

var mysql = require('../../node_modules/sails-mysql/node_modules/mysql');

var connection;

var Transaction = {};

Transaction.createConnection = function (){

  sails.log.info("create new connection");

    var sailsMySqlConfig = sails.config.connections.MicroBusiness;

    var connection = mysql.createConnection({
      host: sailsMySqlConfig.host,
      user: sailsMySqlConfig.user,
      password: sailsMySqlConfig.password,
      database: sailsMySqlConfig.database,
      multipleStatements: true
    });
    sails.log.info("create new connection ok");

  return connection;

};

Transaction.startTransaction = function (connection) {
  connection.query("START TRANSACTION;");
};

Transaction.commit = function (connection,next) {
  connection.query("COMMIT;",function (err) {
    if(err){
      sails.log.error(err);
      if(next){
        next(err);
      }
      return;
    }

    if(next){
      next(err);
    }

    sails.log.info("commit");

  });
};

Transaction.rollback = function (connection,next) {
  connection.query("ROLLBACK;", function (err) {
    if(err){
      sails.log.error(err);
      if(next){
        next(err);
      }
      this.destroyConnection(connection);
      return;
    }

    if(next){
      next(err);
    }
    sails.log.info("rollback");
    connection.end(function (err) {
      if(err){
        sails.log.error(err);
      }
      sails.log.info("close connection");
      if(next){
        next();
      }
    });
  });
};

Transaction.destroyConnection = function (connection){
  connection.end(function (err) {
    if(err){
      sails.log.error(err);
    }
    sails.log.info("close connection");
  });
};

module.exports = Transaction;

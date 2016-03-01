/**
 * Created by jcy on 15/11/17.
 */

module.exports = {
  errorLog: function (errorMsg) {
    if(sails.config.environment==='development'){
      sails.log.error(errorMsg);
    }
  }
};

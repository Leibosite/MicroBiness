/**
 * Created by jcy on 15/8/31.
 */
var Responseutil = require('../util/ResponseUtil');

module.exports = function(req, res, next) {

  var token = req.param('token');
  if(!token){
    return res.json(Responseutil.addTokenErrorMessage());
  }

  User.findOne({where:{token:token}}).exec(function(err,result){
    if(err){
      sails.log.error(err);
      return res.json(Responseutil.addTokenErrorMessage());
    }
    if(!result){
      sails.log.error(err);
      return res.json(Responseutil.addTokenErrorMessage());
    }
    next();
  });

};

/**
 * Created by jcy on 15/10/13.
 */
var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil'),
  _ = require('lodash');
var ResponseUtil = require('../util/ResponseUtil');

module.exports = function destroyRecord(req,res) {

  var id = req.param("id");

  if(!id){
    return res.json(ResponseUtil.addParamNotRight());
  }

  var Model = actionUtil.parseModel(req);

  Model.destroy({id:id}, function (err,destoryRecord) {
    if (err) {
      sails.log.error(err);
      return res.json(ResponseUtil.addErrorMessage());
    }

    sails.log.info(destoryRecord);

    return res.json(ResponseUtil.addSuccessMessage());
  });

};

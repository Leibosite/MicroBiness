/**
 * Created by jcy on 15/10/13.
 */
var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil'),
  _ = require('lodash');
var ResponseUtil = require('../util/ResponseUtil');

module.exports = function findOneRecord(req,res) {

  var id = req.param("id");

  if(!id){
    return res.json(ResponseUtil.addParamNotRight());
  }

  var Model = actionUtil.parseModel(req);

  Model.findOne({id:id}, function (err,oneRecord) {
    if (err) {
      sails.log.error(err);
      return res.json(ResponseUtil.addErrorMessage());
    }

    if(!oneRecord){
      return res.json(ResponseUtil.addRecordNotExistError());
    }

    oneRecord.result_code = 200001;
    oneRecord.result_msg  = "success";
    return res.json(oneRecord);

  });
};

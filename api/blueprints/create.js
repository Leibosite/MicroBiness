/**
 * Created by jcy on 15/10/13.
 */
var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil'),
  _ = require('lodash');
var ResponseUtil = require('../util/ResponseUtil');

module.exports = function createRecord(req,res) {

  try{

    var modelJson = req.param("model");

    if(!modelJson){
      return res.json(ResponseUtil.addParamNotRight());
    }

    var record = JSON.parse(modelJson);

    var Model = actionUtil.parseModel(req);

    Model.create(record, function (err,updateRecord) {
      if (err) {
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }

      sails.log.info(updateRecord);

      return res.json(ResponseUtil.addSuccessMessage());
    });


  }catch(e){
    return res.json(ResponseUtil.addJSONParseError());
  }
};

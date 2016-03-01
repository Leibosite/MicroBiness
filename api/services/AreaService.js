/**
 * Created by leibosite on 2015/8/20.
 */

var ResponseUtil = require('../util/ResponseUtil');
module.exports={
  /**
   * 所有的区域列表
   * @param res
   */
  list:function(res){

    Area.find({level:2}).exec(function(err,areas){

      if(err){
        return res.json(ResponseUtil.addErrorMessage());
      }

      if(!areas){
        return res.json(ResponseUtil.addParamNotRight());
      }

      for(var i in areas){
        for(var j in areas[i]){
          if(j.toString()=="id"|| j.toString()=="name"){
            continue;
          }
          delete areas[i][j];
        }
      }

      var data = ResponseUtil.addSuccessMessage();
      data.areas = areas;
      return res.json(data);

    });
  }
}

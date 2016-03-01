/**
 * Created by leibosite on 2015/8/19.
 */
var ResponseUtil = require('../util/ResponseUtil');
module.exports={
  /**
   * 集市商品分类列表接口
   * @param res
   */
    list: function (res) {

      ProductCategory.find().exec(function(err,result){
        if(err){
          return res.json(ResponseUtil.addErrorMessage());
        }
        var data = ResponseUtil.addSuccessMessage();
        if(result.length == 0 || !result){
          data.product_categories = [];
          return res.json(data);
        }
        for(var i in result){
          for (var k in result[i]){
            var attr = k.toString();
            if(attr == "id" || attr=="name"){
              continue;
            }
            delete result[i][k];
          }
        }
        var data = ResponseUtil.addSuccessMessage();
        data.product_categories= result;
        return res.json(data);
      })
    }
}

/**
 * Created by leibosite on 2015/8/19.
 */
var ResponseUtil = require('../util/ResponseUtil');
module.exports={
  /**
   * 获取个人财富值
   * @param user_id
   * @param res
   */
    getWealth:function(user_id,role,res){
      if(!user_id || !role){
        return res.json(ResponseUtil.addParamNotRight());
      }

      Wealth.findOne({
        where:{user:user_id}
      }).exec(function (err, result){

        if(err){
          sails.log.error(err);
          return res.json(ResponseUtil.addErrorMessage());
        }

        if(!result){
          return res.json(ResponseUtil.addResultIsNull());
        }

        for(var k in result){
          if(k.toString()=="id" || k.toString()== "current_money"){
            continue;
          }
          delete result[k];
        }

        User.findOne({id:user_id}).exec(function(err,user){

          var data = ResponseUtil.addSuccessMessage();
          var headImage = '';
          if(user){
            headImage = sails.config.imageHostUrl + user.head_image;
          }
          data.wealth = result;
          data.wealth.head_image = headImage;
          if(role == 1){
            //合伙人
            User.count({parent_id:user_id,apply_status:{'!':4}}).exec(function(err,countResult){
              if(err){
                sails.log.error(err);
                return res.json(ResponseUtil.addErrorMessage());
              }
              sails.log.info(countResult);
              if(countResult > 0){
                data.wealth.is_exist_new_partner = 1;
              }else{
                data.wealth.is_exist_new_partner = 0;
              }
              return res.json(data);
            });
          }else if(role == 2){
            // 小伙伴
            var data = ResponseUtil.addSuccessMessage();
            data.wealth = result;
            //为0
            data.wealth.is_exist_new_partner = 0;
            return res.json(data);
          }else{
            return res.json(ResponseUtil.addErrorMessage());
          }
        });


      });
    }

};

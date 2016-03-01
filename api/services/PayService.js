/**
 * Created by jcy on 15/8/24.
 */
var ResponseUtil = require('../util/ResponseUtil');
var DecryUtil = require('../util/DecryptUtil');
module.exports = {


  /**
   * 设置支付密码接口
   * @param user_id
   * @param pay_password
   * @param res
   */

  create: function (user_id,pay_password,res) {

    if(!user_id || !pay_password || pay_password.length != 76){
      return res.json(ResponseUtil.addParamNotRight());
    }

    sails.log.info(pay_password);

    var tmpPayPassword = DecryUtil.decrypt(pay_password);

    sails.log.info(tmpPayPassword);
    var token = DecryUtil.getToken(DecryUtil.decrypt(pay_password));

    sails.log.info(token);
    User.findOne({id:user_id},function(err,user){

      if(!user || err){
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }

      if(token != user.token.substring(6,12)){
        sails.log.info("pay password token is error! please check!");
        return res.json(ResponseUtil.addTokenErrorMessage());
      }else{

        var password = DecryUtil.getPayPassword(DecryUtil.decrypt(pay_password));

        sails.log.info(password);

        Pay.findOne({user:user_id}, function (err,payFind){

          if(err){
            return res.json(ResponseUtil.addErrorMessage());
          }

          if(payFind){

            return res.json(ResponseUtil.addPayPasswordExist());

          }else{

            Pay.create({user:user_id,pay_password:password}, function (err,payCreate) {
              if(err){
                return res.json(ResponseUtil.addErrorMessage());
              }

              if(payCreate){
                return res.json(ResponseUtil.addSuccessMessage());
              }
            });
          }
        });
      }
    });
  },

  /**
   * 修改支付密码接口
   * @param user_id
   * @param pay_password
   * @param new_pay_password
   * @param res
   */
  updatePassword: function (user_id,pay_password,new_pay_password,res) {

    if(!user_id || !pay_password || !new_pay_password){
      return res.json(ResponseUtil.addParamNotRight());
    }

    var token = DecryUtil.getToken(DecryUtil.decrypt(pay_password));

    User.findOne({id:user_id},function(err,user){

      if(err){
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }

      if(user.token.substring(6,12) != token){
        sails.log.info('pay password token is error! please check!');
        return res.json(ResponseUtil.addTokenErrorMessage());
      }

      Pay.findOne({user:user_id}, function (err,pay) {

        var payPassword = DecryUtil.getPayPassword(DecryUtil.decrypt(pay_password));
        var newPayPassword =  DecryUtil.getPayPassword(DecryUtil.decrypt(new_pay_password));

        if (err) {
          return res.json(ResponseUtil.addErrorMessage());
        }

        if(pay){

          if(pay.pay_password == payPassword) {
            pay.pay_password = newPayPassword;
            pay.save(function (err, p) {
              if (err) {
                sails.log.info("pay password save error!");
                return res.json(ResponseUtil.addErrorMessage());
              }

              return res.json(ResponseUtil.addSuccessMessage());

            });
          }
          else{
            sails.log.info(ResponseUtil.payPasswordMistake());
            return res.json(ResponseUtil.payPasswordMistake());
          }
        }else{
          sails.log.info(ResponseUtil.addNoPaypasswordMistake())
          return res.json(ResponseUtil.addNoPaypasswordMistake());
        }

      });
    });

  }
};

/**
 * Created by jcy on 15/8/18.
 * Modified by tommy
 */


module.exports = {


    addSuccessMessage: function () {
      var result = {};
      result.result_code = 200001;
      result.result_msg = "success";
      return result;
    },
    addErrorMessage:function(){
        var result = {};
        result.result_code = 200002;
        result.result_msg = "failure";
        return result;
    },
    addDetailErrorMessage:function(message){
      var result = {};

      if(!message){
        message = "";
      }

      result.result_code = 200002;
      result.result_msg = message;
      return result;
    },
    addTokenErrorMessage:function(){
        var result = {};
        result.result_code = 200003;
        result.result_msg = "your token is error,please check!";
      return result;
    },
    addOrderNotExist:function(){
      var result = {};
      result.result_code = 200004;
      result.result_msg = "this order does not exist";
      return result;
    },
    addParamNotRight:function(){
      var result = {};
      result.result_code = 200005;
      result.result_msg = "the request parameter is not right";
      return result;
    },
    addAddressNotExit:function(){
      var result = {};
      result.result_code = 200006;
      result.result_msg = "The Address does not exit";
      return result;
    },
    addJSONParseError: function () {
      var result = {};
      result.result_code = 200007;
      result.result_msg = "model json parse error";
      return result;
    },
    addRecordNotExistError: function () {
      var result = {};
      result.result_code = 200008;
      result.result_msg = "the record can't find,it does not exist";
      return result;
    },
    addRoleError: function () {
      var result = {};
      result.result_code = 200009;
      result.result_msg = "your apply role is wrong!";
      return result;
    },
    addRoleHasExisted: function () {
      var result = {};
      result.result_code = 200010;
      result.result_msg = "you can't create role that has been existed!";
      return result;
    },
    addRegisteredMistake:function(){
      var result = {};
      result.result_code = 400001;
      result.result_msg = "the mobile phone number has been registered";
      return result;
    },
    addLoginErrorMessage:function(){
      var result={};
      result.result_code = 400002;
      result.result_msg = "account does not exist";
      return result;
    },
    addLoginPasswordMistake:function(){
      var result={};
      result.result_code = 400003;
      result.result_msg = "password mistake";
      return result;
    },
    addOriginalPasswordMistake:function(){
      var result = {};
      result.result_code = 400004;
      result.result_msg = "the original password mistake";
      return result;
    },
    addPayPasswordExist:function(){
      var result = {};
      result.result_code = 400005;
      result.result_msg = "pay_password exist";
      return result;
    },
    payPasswordMistake: function () {
      // 400006  支付密码错误  pay_password mistake
      var result={};
      result.result_code = 400006;
      result.result_msg = "pay_password mistake";
      return result;
    },

    moneyNotEnough: function () {
      //400007   财富值不足         your money is not enough
      var result={};
      result.result_code = 400007;
      result.result_msg = "your money is not enough";
      return result;
    },

    addNoPaypasswordMistake:function(){
      var result = {};
      result.result_code = 400008;
      result.result_msg = "you haven’t set pay password";
      return result;
    },



    addMobilePhoneNotExited:function(){
      var result = {};
      result.result_code = 400009;
      result.result_msg = "Found result is null or it's length is zero!";
      return result;
    },

    addAlipayAccountMistake: function () {
      var result = {};
      result.result_code = 400010;
      result.result_msg  = "alipay account mistake";
      return result;
    },
    addUsernameExited:function(){
      var result = {};
      result.result_code = 400011;
      result.result_msg  = "Username exited";
      return result;
    },

    addResultIsNull:function(){
      var result = {};
      result.result_code = 400012;
      result.result_msg = "Found result is null or it's length is zero!";
      return result;
    },

    addOrderFormNotPay: function () {
      var result = {};
      result.result_code = 400013;
      result.result_msg  = "this order form has not pay,it can't be deleted";
      return result;
    },
    //等级升级时 提交的钱数跟需要升级的钱数不等
    addMoneyNotEqual:function(){
      var result = {};
      result.result_code = 400014;
      result.result_msg  = "money is not equal!";
      return result;
    },
    addAlipayAccountMatchError:function(){
      var result = {};
      result.result_code = 400015;
      result.result_msg  = "alipay_account is not equal!";
      return result;
    },

    addExceptionMessageAndCode:function(code,message){
      var result = {};
      result.result_code = code;
      result.result_msg = message;
      return result;
    },

    addMessageAndResultCode:function(code,message,result){

      result.result_code = code;
      result.result_msg = message;
    }

};


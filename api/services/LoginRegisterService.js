/**
 * Created by leibosite on 2015/8/20.
 */

var ResponseUtil = require('../util/ResponseUtil');
var ObjectUtil = require('../util/ObjectUtil');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var TransactionUtil = require('../util/TransactionUtil');
var moment = require('moment');
var UUID = require('node-uuid');
module.exports = {

  /**
   * 登录
   * @param mobile
   * @param password
   * @param res
   */
  login:function(mobile,password,res){

    if(!mobile || !password){
      return res.json(ResponseUtil.addParamNotRight());
    }

    User.findOne({mobile:mobile}).populate('storeInformation').populate('roles').exec(function (err,user) {

      if(err){
        sails.log.error(err);
        return res.json(ResponseUtil.addLoginErrorMessage());
      }

      if(!user){
        return res.json(ResponseUtil.addLoginErrorMessage());
      }

      Passport.findOne({user:user.id}).exec(function (err,passport) {

        if(err){
          sails.log.error(err);
          return res.json(ResponseUtil.addLoginErrorMessage());
        }

        if(!passport){
          sails.log.error(passport);
          return res.json(ResponseUtil.addLoginPasswordMistake());
        }

        bcrypt.compare(password,passport.password, function (err,result) {
          if(err){
            sails.log.error(passport);
            return res.json(ResponseUtil.addLoginPasswordMistake());
          }
          if(!result){
            sails.log.error(passport);
            return res.json(ResponseUtil.addLoginPasswordMistake());
          }

          var successData = ResponseUtil.addSuccessMessage();
          var store_informationID = 0;
          var role = '';

          //sails.log.info("user+++"+user.valueOf());
          var userData = ObjectUtil.cloneAttributes(user);

          for(var i in userData){
            var attr = i.toString();
            if(attr ==="id"|| attr ==="apply_status" || attr ==="mobile" || attr ==="token"){
              continue;
            }

            if(attr === "storeInformation"){
              for(var j in userData[i]){
                if(j.toString() =="id"){
                  store_informationID = userData[i][j];
                }
              }
            }

            if(attr =="roles"){
              for(var m in userData[i]){
                for(var n in userData[i][m]){
                  if(n.toString()=="name"){
                    role = userData[i][m][n];
                    //sails.log.info("role::"+role)
                    continue;
                  }
                }
                //userData[i].splice(m,1);
              }
            }
            delete userData[i];
          }

          userData.store_information_id = store_informationID;

          if(role == 'registered'){
            userData.role = 0;
          }else if(role =='partner'){
            userData.role = 2;
          }else if(role =='copartner'){
            userData.role = 1;
          }else if(role == 'admin'){
            userData.role = 3;
          }
          //userData.role = role;

          //sails.log.info("userData::::"+userData.id);
          //0 表示不存在 1 表示存在
          return Pay.findOne({user:user.id}).exec(function(err,result){
            var existPayPassword = 0;

            //return res.json(successData);
            if(err || !result){
              sails.log.error(err);
              userData.is_exist_pay_password = 0;
              successData.user = userData;
              return res.json(successData);
            }else{
              //sails.log.info(result);
              userData.is_exist_pay_password = 1;
              successData.user = userData;
              return res.json(successData);
            }
          });
        });
      });
    });
  },

  /**
   * 用户注册
   * @param mobile
   * @param password
   * @param res
   */
  userRegister: function (mobile,password,res) {

    if(!mobile || !password){
      return res.json(ResponseUtil.addParamNotRight());
    }

    User.find({mobile:mobile}).exec(function(err,users){

      if(err){
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }

      if(!users || users.length > 0){
        sails.log.info("the mobile phone number has been registered");
        return res.json(ResponseUtil.addRegisteredMistake());
      }

      //TODO 邮件是需要填写的,不是程序自动生成的，如果不填邮件就自动生成
      var email=mobile+'@email.com';

      var token ;
      var md5 = crypto.createHash('md5');
      md5.update(mobile);
      token = md5.digest('hex');

      var conn = TransactionUtil.createConnection();
      TransactionUtil.startTransaction(conn);
      var time = moment().format('YYYY-MM-DD HH:mm:ss');
      var uuid = UUID.v4();

      var userCreateSql = "insert into user(mobile,email,token,username,apply_status,status,wechat_account,head_image,uuid,apply_time,createdAt,updatedAt) " +
        "values('" + mobile + "','" + email + "','" + token + "','" + mobile + "',0,0,'','','" + uuid + "','" + time + "','" + time + "','" + time + "');";

      //sails.log.info(userCreateSql);
      conn.query(userCreateSql, function (err) {
        if (err) {
          sails.log.error(err);
          TransactionUtil.rollback(conn);
          return res.json(ResponseUtil.addErrorMessage());
        }

        bcrypt.hash(password,8,function(err,passwordResult){
          if(err || !passwordResult){
            sails.log.error(err);
            TransactionUtil.rollback(conn);
            return res.json(ResponseUtil.addErrorMessage());
          }

          conn.query("select LAST_INSERT_ID()", function (err, userId) {
            var user_Id = userId[0]["LAST_INSERT_ID()"];
            if (err || !user_Id) {
              sails.log.error(err);
              TransactionUtil.rollback(conn);
              return res.json(ResponseUtil.addErrorMessage());
            }
            var passportCreate = "insert into passport(user,password,protocol,uuid,createdAt,updatedAt) " +
              "values(" + user_Id + ",'" + passwordResult + "','local','" + uuid + "','" + time + "','" + time + "');";

            //sails.log.info(passportCreate);

            conn.query(passportCreate, function (err) {
              if (err) {
                sails.log.error(err);
                TransactionUtil.rollback(conn);
                return res.json(ResponseUtil.addErrorMessage());
              }

              var selectRoleId = "select id from role where name = 'registered';";

              conn.query(selectRoleId,function(err,roleId){
                //sails.log.info(roleId);
                var role_id = roleId[0].id;
                if (err || !role_id) {
                  sails.log.error(err);
                  TransactionUtil.rollback(conn);
                  return res.json(ResponseUtil.addErrorMessage());
                }

                var createUserRole = "insert into role_users__user_roles(role_users,user_roles) " +
                  "values(" + role_id + "," +user_Id+ ");";

                conn.query(createUserRole, function (err) {
                  if (err) {
                    sails.log.error(err);
                    TransactionUtil.rollback(conn);
                    return res.json(ResponseUtil.addErrorMessage());
                  }

                  TransactionUtil.commit(conn, function (err) {
                    if (err) {
                      sails.log.error(err);
                      TransactionUtil.rollback(conn);
                      return res.json(ResponseUtil.addErrorMessage());
                    }
                    TransactionUtil.destroyConnection(conn);
                    return res.json(ResponseUtil.addSuccessMessage());
                  });
                });
              });
            });
          });
        });
      });
    });
  }

};

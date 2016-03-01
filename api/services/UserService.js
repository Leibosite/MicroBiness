/**
 * Created by jcy on 15/8/24.
 */
var ObjectUtil = require("../util/ObjectUtil");
var ResponseUtil = require("../util/ResponseUtil");
var Promise = require("bluebird");
var bcrypt = require('bcrypt');
var fs = require('fs');
var file = require('../util/FileUtil');
var TransactionUtil = require('../util/TransactionUtil');
var moment = require('moment');
var UUID = require('node-uuid');
var DecryUtil = require('../util/DecryptUtil');
var path = require('path');


module.exports = {

  /**
   * 新增小伙伴列表
   * @param id
   * @param res
   */
    newPartnerList: function (id,res) {

      if(!id){
        return res.json(ResponseUtil.addParamNotRight());
      }

      /*
      *项目初始化的时候Role表里面有小伙伴和合伙人两种角色，不然会报错
      */
      Role.findOne({name:"partner"}).populate("users",{apply_status:[2,3,5],parent_id:id}).then(function (role) {
        var users = ObjectUtil.cloneAttributes(role.users);
        return users;
      }).then(function (users) {

        if(!users || users.length == 0){
          throw new Error("USERS_NULL");
        }

        for(var i in users){
          var user = users[i];
          for(var j in user){
            var attr = j.toString();
            if(attr=="id" || attr=="real_name" || attr=="apply_status" || attr=="mobile" || attr=="area"){
              continue;
            }
            delete  user[j];
          }
        }

          var m =0;
          Promise.map(users, function (user) {
            return Area.findOne({id:user.area}).then(function (area) {
              if(area){
                users[m].area = area.name;
              }else{
                users[m].area = "";
              }
              m++;
              return area;
            });
          }).then(function () {

            var responseData = ResponseUtil.addSuccessMessage();
            responseData.users = users;
            return res.json(responseData);

          })
            .catch(function (err) {
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          });



      }).catch(function (err) {
        if(err.message == "USERS_NULL"){
          var responseData = ResponseUtil.addSuccessMessage();
          responseData.users = [];
          sails.log.info("newPartnerList ----USERS_NULL");
          return res.json(responseData);
          }else{
          sails.log.error(err);
          return res.json(ResponseUtil.addErrorMessage());
        }
      })
    },

  /**
   * @description
   * 通过、拒绝小伙伴申请接口（一级审核）
   * 小伙伴未申请时默认值是0
   * 小伙伴提交申请后变为2
   * 合伙人进行一级审核，审核成功变为3，等待后台的二级审核
   * 申请被拒绝变为5
   * @param id
   * @param type
   * @param res
   */
    parentVerify: function (id,type,res) {

      if(!id || !type){
        return res.json(ResponseUtil.addParamNotRight());
      }

      User.findOne({id:id}, function (err,user) {

        if(err || !user){
          return res.json(ResponseUtil.addErrorMessage());
        }

        if(type==0){
          user.apply_status = 5;
        }else if(type==1){
          user.apply_status = 3;
        }

        user.save(function (err,user) {
          if(err){
            return res.json(ResponseUtil.addErrorMessage());
          }

          user = ObjectUtil.cloneAttributes(user);

          for(var i in user){
            var attr = i.toString();
            if(attr=="id" || attr=="real_name" || attr=="apply_status"){
              continue;
            }
            delete user[i];
          }

          var responseData = ResponseUtil.addSuccessMessage();
          responseData.user = user;
          return res.json(responseData);
        });

      });
    },

  /**
   * 更改用户名称
   * @param id
   * @param user_name
   * @param res
   */
    updateUserName: function (id,user_name,res) {
      if(!id || !user_name){
        return res.json(ResponseUtil.addParamNotRight());
      }
      //User.count({username:user_name}).exec()
      User.findOne({id:id}).exec(function (err,user) {
        if(err) res.json(ResponseUtil.addErrorMessage());
        if(!user) res.json(ResponseUtil.addErrorMessage())
        else{
          User.update({id:id},{username:user_name}).exec(function(err,result){
            if(err){
              return res.json(ResponseUtil.addUsernameExited());
            }
            return res.json(ResponseUtil.addSuccessMessage());
          });
          }
        });
    },

  /**
   * 更改微信帐号
   * @param id
   * @param wechat_account
   * @param res
   */
    updateWechatAccount: function (id,wechat_account,res) {

      if(!id || !wechat_account){
        return res.json(ResponseUtil.addParamNotRight());
      }

      User.findOne({id:id}).exec(function (err,user) {
        if(err) return res.json(ResponseUtil.addErrorMessage());

        if(!user) {
          return res.json(ResponseUtil.addErrorMessage());
        }
        else{

          User.update({id:id},{wechat_account:wechat_account}).exec(function(err,result){
            if(err){
              return res.json(ResponseUtil.addErrorMessage());
            }
            return res.json(ResponseUtil.addSuccessMessage());
          });
        }
      });
    },

  /**
   *小伙伴列表
   * @param id
   * @param res
   */
    partnerList: function (id,res) {

      if(!id){
        return res.json(ResponseUtil.addParamNotRight());
      }

      User.find({parent_id:id,apply_status:4}).exec(function (err,users) {
        var data = ResponseUtil.addSuccessMessage();
        if(err) return res.json(ResponseUtil.addErrorMessage());

        //sails.log.info(users.length);

        if(users.length == 0 ){

          data.users = [];
          return res.json(data);

        }else{

          for(var i in users){

            var headImage = '';
            for(var j in users[i]){
              attr = j.toString();
              if(attr=="id"|| attr=="real_name"
                || attr=="apply_status" || attr=="status"){
                continue;

              }
              if(attr=="head_image"){
                headImage = sails.config.imageHostUrl + users[i][j];
              }
              delete users[i][j];
            }
            users[i].head_image = headImage;
          }
          data.users = users;
          return res.json(data);
        }
      })
    },

  /**
   * 获取合伙人组织信息
   * @param id
   * @param res
   */
    getOrganization: function (id,res) {

      if(!id){
        return res.json(ResponseUtil.addParamNotRight());
      }

      User.findOne({id:id}).populate('area').then(function (user) {
        if(!user){
          throw new Error("USER_NULL");
        }

        var parentID = 0;

        for(var i in user){
          if(i.toString()=="parent_id"){
            parentID = user[i];
            break;
          }
        }
        return parentID;
      }).then(function(parentID){


        if(parentID == 0 || !parentID){
          throw new Error("PARENTID_NULL");
          //return res.json(ResponseUtil.addErrorMessage());
        }

        return User.findOne({id:parentID}).then(function(user){
          if(!user){
            sails.log.info("user not found!");
          }
          return user;
        }).then(function(parentUser){

          if(!parentUser){
            throw new Error("PARENTUSER_NULL");
          }
          return User.find({parent_id:parentUser.id,apply_status:4}).populate('area').then(function (users) {
            if(!users || users.length == 0){
              throw new Error("USER_LIST_NULL");
              //return res.json(ResponseUtil.addErrorMessage());
            }
            var usersData = ObjectUtil.cloneAttributes(users);
            //var user ;
            var number;
            for(var i in usersData) {
              var headImage = '';
              for (var j in usersData[i]) {
                if(j.toString()=="id" && usersData[i][j] == id){
                  //user = usersData[i];
                  number = i;
                  break;
                }
                if (j.toString() == "real_name"
                  || j.toString() == "wechat_account" || j.toString() == "id") {
                  continue;
                }
                if(j.toString() == "head_image"){
                  headImage = sails.config.imageHostUrl + usersData[i][j];
                }
                delete usersData[i][j];
              }
              usersData[i].head_image = headImage;
            }

            var userData=ObjectUtil.cloneAttributes(parentUser);

            var headImage = '';
            for(var i in userData){
              if(i.toString()=="parent_id"||i.toString() == "real_name"
                || i.toString() == "wechat_account"){
                continue;
              }
              if(i.toString() == "head_image"){
                headImage = sails.config.imageHostUrl + userData[i];
              }
              delete userData[i];
            }
            userData.head_image = headImage;
            usersData.splice(number,1);
            var successData = ResponseUtil.addSuccessMessage();
            successData.user = userData;
            successData.users = usersData;
            return res.json(successData);
          }).catch(function(err){
            if(err.message == "USER_LIST_NULL"){
              var successData = ResponseUtil.addSuccessMessage();
              successData.user = userData;
              successData.users = [];
              return res.json(successData);
            }
          });
        });
      }).catch(function (err) {

        if(err.message == "USER_NULL"){
          sails.log.info("USER_NULL");
          return res.json(ResponseUtil.addResultIsNull());
        }else if(err.message == "PARENTUSER_NULL"){
          var successData = ResponseUtil.addSuccessMessage();
          successData.user = [];
          successData.users = [];
          sails.log.info("PARENTUSER_NULL");
          return res.json(successData);
        }else if(err.message == "PARENTID_NULL"){
          sails.log.info("PARENTID_NULL");
          return res.json(ResponseUtil.addResultIsNull());
        }else{
          sails.log.error(err);
          sails.log.info(err.message);
          return res.json(ResponseUtil.addErrorMessage());
        }
      });
  },

  /**
   * 删除小伙伴申请 修改用户status字段：0为正常，1为冻结
   * @param id
   * @param res
   */
  deletePartnerApply: function (id,res) {

    if(!id){
      return res.json(ResponseUtil.addParamNotRight());
    }

    User.findOne({id:id}).then(function(user){

      if(!user){
        sails.log.info("error");
        return res.json(ResponseUtil.addErrorMessage());
      }
    //TODO:BUG
      return User.update({id:id},{status:1}).then(function (result) {
        //sails.log.info("result::");
        //sails.log.info(result);
        if(!result){
          return res.json(ResponseUtil.addErrorMessage());
        }

        return user;
      });

    }).then(function(user){
      //sails.log.info("user:::");
      //sails.log.info(user);
      if(!user){
        sails.log.info("error");
        return res.json(ResponseUtil.addErrorMessage());
      }
      var parentID = user.parent_id;
      User.find({ parent_id : parentID, apply_status : 4 }).then(function (users) {
        //sails.log.info("users:::::");
        //sails.log.info(users);
        for(var i in users){
          var user = users[i];
          var headImage = "";
          for(var j in user){
            if(j.toString()=="id" || j.toString()=="real_name"||  j.toString()=="status"){
              continue;
            }
            if(j.toString() == "head_image"){
              if(user[j] == null){
                headImage = sails.config.imageHostUrl;
              }else{
                headImage = sails.config.imageHostUrl + user[j];
              }
            }
            delete user[j];
          }
          user.head_image = headImage;
        }
        var successData = ResponseUtil.addSuccessMessage();
        successData.users = users;
        return res.json(successData);
      });

    }).catch(function (err) {
      if(err){
        //sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }
    });
  },

  /**
   * 修改充值（提现）账号接口
   * @param id
   * @param alipay_account
   * @param pay_password
   * @param new_alipay_account
   * @param res
   */
  updateAlipayAccount: function (id,alipay_account,pay_password,new_alipay_account,res) {

    if(!id || !alipay_account || !pay_password || !new_alipay_account){
      return res.json(ResponseUtil.addParamNotRight());
    }
    var payPassword = DecryUtil.getPayPassword(DecryUtil.decrypt(pay_password));

    User.findOne({id:id}).exec(function (err,user) {
      if(err){
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }
      if(!user){
        return res.json(ResponseUtil.addErrorMessage());
      }
      //原支付账号验证
      if(alipay_account != user.alipay_account){
        sails.log.info("alipay_account is not equal!");
        return res.json(ResponseUtil.addAlipayAccountMatchError());
      }
      Pay.findOne({user:user.id}).exec(function(err,payResult){
        //sails.log.info(payResult);
        if(err){
          sails.log.error(err);
          return res.json(ResponseUtil.addErrorMessage());
        }
        if(!payResult){
          sails.log.info("no pay password error!");
          return res.json(ResponseUtil.addNoPaypasswordMistake());
        }
        if(payPassword != payResult.pay_password){
          sails.log.info("pay password is mistake!");
          return res.json(ResponseUtil.payPasswordMistake());
        }
        user.alipay_account = new_alipay_account;
        user.save(function (err, result) {
          if (err || !result) {
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          }
          return res.json(ResponseUtil.addSuccessMessage());
        });
      });
    });
  },

  /**
   * 获取个人信息详情
   * @param id
   * @param res
   */
  getDetail:function(id,res){
    if(!id){
      return res.json(ResponseUtil.addParamNotRight());
    }

    User.findOne({id:id}).populate("area").exec(function(err,user){
      if(err){
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }
      var areaName ='';
      for(var i in user){
        if(i.toString()=="id"|| i.toString()=="username"|| i.toString()=="real_name"|| i.toString()=="head_image"
          || i.toString()=="wechat_account"|| i.toString()=="invite_code"|| i.toString()=="apply_status"
          || i.toString()=="mobile" ){
          continue;
        }
        if(i.toString()=="area"){
          for(var j in user[i]){
            if(j.toString()=="name"){
              areaName = user[i][j];
              //sails.log.info(areaName);
              break;
            }
          }
        }
        delete user[i];
      }
      user.area = areaName;
      //user.head_image = '';
      if(user.head_image){
        user.head_image = sails.config.imageHostUrl+user.head_image;
      }else{
        user.head_image = sails.config.imageHostUrl;
      }

      var userData = ObjectUtil.cloneAttributes(user);
      var successData = ResponseUtil.addSuccessMessage();
      successData.user = userData;
      return res.json(successData);
    })
  },

  /**
   * 提交申请成为合伙人或者小伙伴接口
   * @param req
   * @param res
   */
  applyAccount:function(req,res) {

    var id = req.param('id');
    var real_name = req.param('real_name');
    var id_card_number = req.param('id_card_number');
    var mobile = req.param('mobile');
    var alipay_account = req.param('alipay_account');
    var area_id = req.param('area_id');
    var role = req.param('role');
    var invite_code=req.param('invite_code');
    var apply_status = 0;
    var apply_time = moment().format('YYYY-MM-DD HH:mm:ss');

    if( !id || !real_name || !id_card_number || !mobile || !alipay_account || !area_id || !role ){
      return res.json(ResponseUtil.addParamNotRight());
    }

    var pathSep = path.sep;
    var baseURL = file.imageFoldPath;
    var dirName = baseURL+file.uploadIdCardImageDir+id+pathSep;


    sails.log.info('param right ...');

    User.findOne({id: id}).exec(function (err, user) {

      if(err){
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }

      if (!user) {
        sails.log.error("user doesn't found!");
        return res.json(ResponseUtil.addErrorMessage());
      }

      req.file('image_files').upload({
        maxBytes:sails.config.imageUploadMaxBytes,
        dirname:dirName
      }, function (err,images) {

        sails.log.info('param error',images);
        if(err){
          sails.log.error('upload image error',err);
          return res.json(ResponseUtil.addErrorMessage());
        }

        if(!images || images.length < 2){
          sails.log.info('you should upload two picture ');
          return res.json(ResponseUtil.addErrorMessage());
        }



        var frontFilename = images[0].fd;
        var frontArr = frontFilename.split(pathSep);
        var frontImagePath = file.uploadIdCardImageDir  + id + pathSep + frontArr[frontArr.length - 1];

        var backFilename = images[1].fd;
        var backArr = backFilename.split(pathSep);
        var backImagePath = file.uploadIdCardImageDir + id + pathSep + backArr[backArr.length - 1];

        var deleteMsg = 'success delete image';
        if(user.card_image_front){
          file.deleteFile(baseURL+user.card_image_front,deleteMsg);
        }
        if(user.card_image_back){
          file.deleteFile(baseURL+user.card_image_back,deleteMsg);
        }

        var roleName = '';

        StoreInformation.findOne({user:id}).exec(function(err,storeInformation){
          if(err){
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          }
          if(!storeInformation){

            //申请成为合伙人
            if(role == 1){

              roleName = 'copartner';
              //合伙人邀请码自动生成
              invite_code = parseInt(1000000 + parseInt(id),16);

              apply_status = 1;
              Role.findOne({name:roleName}).exec(function(err,role){

                if(err || !role){
                  sails.log.error(err);
                  return res.json(ResponseUtil.addErrorMessage());
                }

                var conn = TransactionUtil.createConnection();
                TransactionUtil.startTransaction(conn);
                var time = moment().format('YYYY-MM-DD HH:mm:ss');
                var uuid = UUID.v4();

                var storeInformationCreate = "insert into store_information(user,name,announcement,head_image,background_image,status,rank,guest,level,uuid,createdAt,updatedAt) " +
                  "values("+id+",'谷谷小店','TA很懒，什么都没留下~','','',0,0,0,0,'"+uuid+"','" + time + "','" + time + "');";


                //sails.log.info(storeInformationCreate);
                conn.query(storeInformationCreate, function (err) {
                  if(err){
                    sails.log.error(err);
                    TransactionUtil.rollback(conn);
                    return res.json(ResponseUtil.addErrorMessage());
                  }

                  conn.query("select LAST_INSERT_ID()", function (err, storeInformationID) {
                    var storeInformation_id = storeInformationID[0]["LAST_INSERT_ID()"];
                    if(err || !storeInformation_id){
                      sails.log.error(err);
                      TransactionUtil.rollback(conn);
                      return res.json(ResponseUtil.addErrorMessage());
                    }

                    var updateUserSql = "update user set real_name='"+real_name+"'," +
                      "id_card_number='"+id_card_number+"',"+
                      "alipay_account='"+alipay_account+"'," +
                      "parent_id=0"+","+
                      "area="+area_id+","+
                      "invite_code='"+invite_code+"',"+
                      "apply_time='"+apply_time+"',"+
                      "card_image_back='"+backImagePath+"',"+
                      "card_image_front='"+frontImagePath+"',"+
                      "storeInformation="+storeInformation_id+","+
                      "apply_status="+apply_status+
                      " where id="+id+";";

                    //sails.log.info(updateUserSql);
                    conn.query(updateUserSql, function (err) {
                      if(err){
                        sails.log.error(err);
                        TransactionUtil.rollback(conn);
                        return res.json(ResponseUtil.addErrorMessage());
                      }

                      var updateUserRole = "update role_users__user_roles set role_users="+role.id+" where user_roles="+id;
                      //sails.log.info(updateUserRole);
                      conn.query(updateUserRole, function (err) {
                        if (err) {
                          sails.log.error(err);
                          TransactionUtil.rollback(conn);
                          return res.json(ResponseUtil.addErrorMessage());
                        }



                        var wealthCreate = "insert into wealth(user,current_money,uuid,createdAt,updatedAt) " +
                          "values("+id+",'0.0','"+uuid+"','" + time + "','" + time + "');";
                        //sails.log.info(wealthCreate);
                        conn.query(wealthCreate, function (err) {
                          if(err){
                            sails.log.error(err);
                            TransactionUtil.rollback(conn);
                            return res.json(ResponseUtil.addErrorMessage());
                          }

                          var storeCategoryCreate = "insert into store_category(storeInformation,name,uuid,createdAt,updatedAt) " +
                            "values("+storeInformation_id+",'热卖商品','"+uuid+"','" + time + "','" + time + "');";
                          //sails.log.info(storeCategoryCreate);
                          conn.query(storeCategoryCreate, function (err) {

                            if(err){
                              sails.log.error(err);
                              TransactionUtil.rollback(conn);
                              return res.json(ResponseUtil.addErrorMessage());
                            }

                            TransactionUtil.commit(conn, function (err) {
                              if(err){
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

            }else if(role == 2){
              //申请成为小伙伴
              roleName = 'partner';

              apply_status = 2;
              if(!invite_code){
                return res.json(ResponseUtil.addParamNotRight());
              }

              Role.findOne({name:roleName}).exec(function(err,role) {

                if(err || !role){
                  sails.log.error(err);
                  return res.json(ResponseUtil.addErrorMessage());
                }

                User.findOne({invite_code: invite_code}).populate("roles", {name: "copartner"}).populate("storeInformation")
                  .exec(function (err, copartner) {

                    if (err || !copartner) {
                      sails.log.error(err);
                      return res.json(ResponseUtil.addErrorMessage());
                    }


                    var conn = TransactionUtil.createConnection();
                    TransactionUtil.startTransaction(conn);
                    var time = moment().format('YYYY-MM-DD HH:mm:ss');
                    var uuid = UUID.v4();

                    var storeInformationCreate = "insert into store_information(user,name,head_image,background_image,level,uuid,createdAt,updatedAt) " +
                      "values("+id+",'店铺','','',"+copartner.storeInformation.level+",'"+uuid+"','" + time + "','" + time + "');";

                    conn.query(storeInformationCreate, function (err) {
                      if(err){
                        sails.log.error(err);
                        TransactionUtil.rollback(conn);
                        return res.json(ResponseUtil.addErrorMessage());
                      }

                      conn.query("select LAST_INSERT_ID()", function (err, storeInformationID) {
                        var storeInformation_id = storeInformationID[0]["LAST_INSERT_ID()"];
                        if(err || !storeInformation_id){
                          sails.log.error(err);
                          TransactionUtil.rollback(conn);
                          return res.json(ResponseUtil.addErrorMessage());
                        }

                        var updateUserSql = "update user set real_name='"+real_name+"'," +
                          "id_card_number='"+id_card_number+"',"+
                          "alipay_account='"+alipay_account+"'," +
                          "parent_id="+copartner.id+","+
                          "area="+area_id+","+
                          "invite_code='"+invite_code+"',"+
                          "apply_time='"+apply_time+"',"+
                          "card_image_back='"+backImagePath+"',"+
                          "card_image_front='"+frontImagePath+"',"+
                          "storeInformation="+storeInformation_id+","+
                          "apply_status="+apply_status+
                          " where id="+id+";";


                        conn.query(updateUserSql, function (err) {
                          if(err){
                            sails.log.error(err);
                            TransactionUtil.rollback(conn);
                            return res.json(ResponseUtil.addErrorMessage());
                          }

                          var updateUserRole = "update role_users__user_roles set role_users="+role.id+" where user_roles="+id;

                          conn.query(updateUserRole, function (err) {
                            if (err) {
                              sails.log.error(err);
                              TransactionUtil.rollback(conn);
                              return res.json(ResponseUtil.addErrorMessage());
                            }



                            var wealthCreate = "insert into wealth(user,current_money,uuid,createdAt,updatedAt) " +
                              "values("+id+",'0.0','"+uuid+"','" + time + "','" + time + "');";

                            conn.query(wealthCreate, function (err) {
                              if(err){
                                sails.log.error(err);
                                TransactionUtil.rollback(conn);
                                return res.json(ResponseUtil.addErrorMessage());
                              }

                              var storeCategoryCreate = "insert into store_category(storeInformation,name,uuid,createdAt,updatedAt) " +
                                "values("+storeInformation_id+",'栏目','"+uuid+"','" + time + "','" + time + "');";

                              conn.query(storeCategoryCreate, function (err) {

                                if(err){
                                  sails.log.error(err);
                                  TransactionUtil.rollback(conn);
                                  return res.json(ResponseUtil.addErrorMessage());
                                }

                                TransactionUtil.commit(conn, function (err) {
                                  if(err){
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
              });
            }else{
              return res.json(ResponseUtil.addRoleError());
            }

          }else{
            return res.json(ResponseUtil.addSuccessMessage());
          }
        });

        });
    });
  },

  /**
   * 找回密码
   * @param mobile
   * @param password
   * @param res
   */
  forgetPassword:function(mobile,password,res){

    if(!mobile || !password){
      return res.json(ResponseUtil.addParamNotRight());
    }

    User.findOne({mobile:mobile}).exec(function (err,user) {
      if(err || !user){
        sails.log.error(err);
        return res.json(ResponseUtil.addMobilePhoneNotExited());
      }
      Passport.findOne({user:user.id}).exec(function(err,passport){
        if(err){
          sails.log.error(err);
          return res.json(ResponseUtil.addErrorMessage());
        }
        //sails.log.info(passport);
        passport.password = password;
        passport.save(function(err,result){
          if(err){
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          }
          return res.json(ResponseUtil.addSuccessMessage());
        })
      })
    })
  },

  /**
   * 修改登录密码
   * @param id
   * @param password
   * @param new_password
   * @param res
   */
  updatePassword: function (id,password,new_password,res) {
    if(!id || !password || !new_password){
      return res.json(ResponseUtil.addParamNotRight());
    }

    User.findOne({id:id}).exec(function(err,user){
      if(err || !user){
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }
      Passport.findOne({user:user.id}).exec(function(err,passport){
        if(err){
          sails.log.error(err);
          return res.json(ResponseUtil.addErrorMessage());
        }
        bcrypt.compare(password,passport.password, function (err,result) {
          if(err){
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          }
          if(!result){
            sails.log.info("the original password mistake");
            return res.json(ResponseUtil.addOriginalPasswordMistake());
          }

          passport.password = new_password;
          passport.save(function(err,results){
            if(err){
              sails.log.error(err);
              return res.json(ResponseUtil.addErrorMessage());
            }
            return res.json(ResponseUtil.addSuccessMessage());
          });
        });
      });
    });
  },

  /**
   * 修改头像
   * @param req
   * @param res
   */
  updateHeadImage:function(req,res) {
    var id = req.param('id');
    if(!id){
      return res.json(ResponseUtil.addParamNotRight());
    }

    try{

        var dirName = file.imageFoldPath+file.uploadHeadImageDir+id+"/";
      //var dirName = file.baseFilePath+file.uploadHeadImageDir+id+"/";

        User.findOne({id:id}).exec(function(err,foundUser){

          if(err || !foundUser){
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          }


          //sails.log.info(foundUser);
          req.file('head_image').upload({
            maxBytes:1000000,
            dirname:dirName
          },function(err,uploadedFiles){

            if(err){
              sails.log.error(err);
              return res.json(ResponseUtil.addErrorMessage());
            }

            if(uploadedFiles.length === 0){
              return res.json(ResponseUtil.addErrorMessage());
            }
            sails.log.info(uploadedFiles);

            var oldHeadImage;
            if(foundUser.head_image){
              oldHeadImage = foundUser.head_image;
            }
            var localFilename = uploadedFiles[0].fd;
            var arr = localFilename.split('/');
            var headImagePath =  file.uploadHeadImageDir  + id + '/' + arr[arr.length - 1];


              User.update({id:id},{head_image:headImagePath}).exec(function (err, updateUser) {

                if(err){
                  sails.log.error(err);
                  return res.json(ResponseUtil.addErrorMessage());
                }

                //修改是就图片删除
                if (oldHeadImage) {
                  var oldImagePathArray = foundUser.head_image.split('/');
                  var oldAvatarLocalPath = file.imageFoldPath+file.uploadHeadImageDir + id + oldImagePathArray[oldImagePathArray.length - 1];

                  file.deleteFile(oldAvatarLocalPath,'delete old head image success');

                }
                //sails.log.info(updateUser);
                return res.json(ResponseUtil.addSuccessMessage());
              });
            });
        });
    }catch(exception){
      sails.log.error(exception);
      return res.json(ResponseUtil.addErrorMessage());
    }
  }

  /**
   * 0 未申请
   * 1 申请已提交，等待审核(审核合伙人)
   * 2 申请已提交，等待一级合伙人审核(审核小伙伴)
   * 3 申请已提交，等待二级平台审核(审核小伙伴)
   * 4 审核通过
   * 5 申请被拒绝
   */
};


/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */
var _ = require('lodash');
var Promise = require('bluebird');
module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

  var initRoles = [
    {name:'partner',active:1,description:'小伙伴'},
    {name:'copartner',active:1,description:'合伙人'}];

  Role.findOrCreate(initRoles).exec(function(err,roles){
    sails.log.info("初始化角色");
  });

  var initModels = [
    {name:'FinanceManage',identity:'financemanage'},
    {name:'StoreManage',identity:'storemanage'},
    {name:'SystemManage',identity:'systemmanage'},
    {name:'ProductManage',identity:'productmanage'},
    {name:'CopartnerManage',identity:'copartnermanage'},
    {name:'CustomerManage',identity:'customermanage'}];
  //storeManage 下级管理的表
  var storeManage = ['Story','StoryImage','StoryColumn','StoryCategory'];
  var financeManage = ['AccountRecord'];
  var systemManage = ['User'];
  var productManage = ['Product'];
  var copartnerManage = ['StoreCategory','StoreInformation','StoreProductManage'];
  var customerManage =['Address'];

  var pidMap = {FinanceManage:financeManage,
                StoreManage:storeManage,
                SystemManage:systemManage,
                ProductManage:productManage,
                CopartnerManage:copartnerManage,
                CustomerManage:customerManage};

  Model.findOrCreate(initModels).exec(function(err,models){
    sails.log.info('初始化顶级功能菜单Model');
    if(_.isArray(models)){
      Promise.map(models, function (model) {
        return Model.update({name:pidMap[model.name]},{pid:model.id})

      }).then(function () {
        sails.log.info('init model success');
      }).catch(function (err) {
        sails.log.error('init model function error:',err);
      });
    }
  });

  cb();
};

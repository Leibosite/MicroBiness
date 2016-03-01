// api/controllers/PermissionController.js

var _ = require('lodash');
var _super = require('sails-permissions/api/controllers/PermissionController');
var ResponseUtil = require('../util/ResponseUtil');

_.merge(exports, _super);
_.merge(exports, {

  /**
   * 批量为角色添加权限
   * @param req
   * @param res
   *  permissions = {roleID:1,roleName:'admin',models:[1,2,3,4]}
   */
  grantPermissionForModel: function (req,res) {

    var permissons = req.param('permissions');
    if(!_.isEmpty(permissons)){
      try{
        var permissionForModel = JSON.parse(permissons);
        var models = permissionForModel.models;
        var roleID = permissionForModel.roleID;
        var roleName = permissionForModel.roleName;
        sails.log.info(roleID,roleName);
        if (!_.isEmpty(models) && _.isArray(models) && models.length>0) {


            if(!_.isEmpty(roleName) && _.isUndefined(roleID)){
              PermissionService.createPermissions(roleName,models,res);
            }else if(_.isNumber(roleID) && _.isEmpty(roleName)){
              PermissionService.updatePermissons(roleID,models,res);
            }else{
              sails.log.error('grantPermissionForModel param error');
              return res.json(ResponseUtil.addParamNotRight());
            }
        }else{
          sails.log.error('grantPermissionForModel permission model null error');
          return res.json(ResponseUtil.addErrorMessage());
        }

      }catch(e){
        sails.log.error('grantPermissionForModel permissons json parse error',e);
        return res.json(ResponseUtil.addErrorMessage());
      }

    }else{
      sails.log.error('grantPermissionForModel permissons null error');
      return res.json(ResponseUtil.addErrorMessage());
    }

  }

});

// api/services/PermissionService.js

var _ = require('lodash');
var _super = require('sails-permissions/api/services/PermissionService');
var ResponseUtil = require('../util/ResponseUtil');
var Promise = require('bluebird');
var CREATE_PERMISSION_ERROR = 'create_permission_error';

function PermissionService () { }

PermissionService.prototype = Object.create(_super);
_.extend(PermissionService.prototype, {

  createPermissions: function (roleName,models,res) {

    var p = Role.findOne(
              {name:roleName}
            ).then(function (role) {
              if(!_.isEmpty(role)){
                sails.log.info('cancel create role');
                res.json(ResponseUtil.addRoleHasExisted());
                return p.cancel();
              }
            }).then(function () {
              return Role.create({name:roleName});
            }).then(function (result) {
              if(_.isEmpty(result)){
                throw new Error(CREATE_PERMISSION_ERROR);
              }

              var roleID = result.id;
              return Promise.map(models,function(modelID) {
                var permisson = [{role: roleID, model: modelID, relation: 'role', action: 'create'},
                  {role: roleID, model: modelID, relation: 'role', action: 'read'},
                  {role: roleID, model: modelID, relation: 'role', action: 'update'},
                  {role: roleID, model: modelID, relation: 'role', action: 'delete'}];
                return Permission.create(permisson);
              });
            }).then(function () {
              return res.json(ResponseUtil.addSuccessMessage());
            }).catch(function (err) {
              sails.log.error('create permission for role error;\n',err);
              return res.json(ResponseUtil.addErrorMessage());
            });
  },

  updatePermissons: function (roleID,models,res) {

    Permission.destroy(
        {role:roleID}
      ).then(function () {

        return Promise.map(models,function(modelID) {
          var permisson = [{role: roleID, model: modelID, relation: 'role', action: 'create'},
            {role: roleID, model: modelID, relation: 'role', action: 'read'},
            {role: roleID, model: modelID, relation: 'role', action: 'update'},
            {role: roleID, model: modelID, relation: 'role', action: 'delete'}];
          return Permission.create(permisson);
        });

      }).then(function () {
        return res.json(ResponseUtil.addSuccessMessage());
      }).catch(function (err) {
        sails.log.error('update permission for role error',err);
        return res.json(ResponseUtil.addSuccessMessage());
      });

  }

});

module.exports = new PermissionService();

/**
 * 微信公众号个人中心Controller
 * Created by tommy on 15/8/28.
 */
var LocationService = require("../services/wechat/LocationService");

module.exports = {
  getLocation:function(req,res){
    // 按照区域level进行过滤，过滤掉level=3的三级区域，三级区域预留以后做扩展
    sails.log.info("--------------------LocationService(){}  start");
    sails.log.info("--------------------LocationService(){}  id is");

    var id = req.param('id');
    sails.log.info(id);
    LocationService.get(id,res);
    sails.log.info("--------------------LocationService(){}  End");
  },
  postLocation:function(req,res){
    var data = req.param('data');
    var openId=req.param('openId');
    LocationService.post(data,res,openId);
  }
};

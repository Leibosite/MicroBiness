/**
 * Created by tommy on 15/8/31.
 */
var ResponseUtil = require('../../util/ResponseUtil');

module.exports = {

  /**
   * 用户首次进入微信公众号获取用户位置
   */
  get: function (id, res) {

    var area_level = 3;
    sails.log.info(id);
    if (id == null || id == undefined) {
      area_level = 1;
      Area.find({level: area_level}).exec(function (err, datas) {
        sails.log.info(datas);
        if (err) {
          return res.json(ResponseUtil.addErrorMessage());
        }
        var result = {};
        result = ResponseUtil.addSuccessMessage();
        var area_one = [];
        var area_two = [];
        for (var i in datas) {
          var data = datas[i];
          // 添加一级区域
          if (data.level == 1) {

            for (var j in data) {

              if (j.toString() == "id" || j.toString() == "name") {
                continue;
              }
              console.log(data[j]);
              delete  data[j];


            }
            area_one.push(data);
          }

        }
        var data = {};
        data.area_one = area_one;
        result.data = data;
        return res.json(result);
      });
    }
    else {
      area_level = 2;
      sails.log.info(area_level);
      Area.find({level: area_level, parent_id: id}).exec(function (err, datas) {
        sails.log.info(datas);
        if (err) {
          return res.json(ResponseUtil.addErrorMessage());
        }
        var result = {};
        result = ResponseUtil.addSuccessMessage();
        var area_two = [];
        for (var i in datas) {
          var data = datas[i];
          // 添加一级区域
          if (data.level == 2) {

            for (var j in data) {

              if (j.toString() == "id" || j.toString() == "name") {
                continue;
              }
              console.log(data[j]);
              delete  data[j];


            }
            area_two.push(data);
          }

        }
        var data = {};
        data.area_two = area_two;
        result.data = data;
        return res.json(result);
      });

    }

  },
  /**
   * 用户首次进入微信公众号获取用户位置
   */
  post: function (data, res, openId) {
    sails.log.info("--------------{start}--|Function:locationPost()|-----|用户提交位置信息|-------");
    sails.log.info("--------------[bs]---{data}-------|位置信息为:|--------------");
    sails.log.info(data);
    sails.log.info("--------------[bs]---{openId}-------|openId为:|--------------");
    sails.log.info(openId);
    if (!openId || openId == '?' || openId == '')
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    if (data == null || data == undefined || data == '')
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_address.code, ResultCode.miss_address.msg));
    try {
      data = JSON.parse(data);
      if (!data.area_two.id || !data.area_one.id )
        return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.invalid_json_data.code, ResultCode.invalid_json_data.msg));
      var currentLocationId=data.area_two.id;
      sails.log.info("--------------[bs]---{updating user current location}-------|开始更新用户当前位置:|--------------");
      User.update({open_id: openId}, {currentLocation: data.area_two.id}, function (err, result) {

        if (err) {
          sails.log.error("--------------[bs]---{updating user current location error}-------|更新用户当前位置出错|--------------");
          sails.log.error(err);
          return res.json(ResponseUtil.addErrorMessage());
        }
        sails.log.info("--------------[bs]---{updated user current location }-------|更新后用户当前位置为|--------------");
        sails.log.info(data.area_two.id);
        sails.log.info(data.area_two.name);
        return res.json(ResponseUtil.addSuccessMessage());
      });
    } catch (err) {
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.invalid_json_data.code, ResultCode.invalid_json_data.msg));
    }


  }
};

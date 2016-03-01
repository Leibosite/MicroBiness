/**
 * Created by yinxin on 2015-11-2.
 */
var ResponseUtil = require('../util/ResponseUtil');
var Promise = require('bluebird');
var ObjectUtil = require('../util/ObjectUtil');

module.exports = {
    list: function (req, res) {
        UpgradeRecharge.find().then(function (records) {
            Promise.map(records, function (record) {

                var toUserId = record.to_user_id;
                if (toUserId) {
                    return User.findOne({ id: toUserId }).then(function (toUser) {
                        if (toUser) {
                            record.to_user_id = toUser.username;
                        }
                        else {
                            record.to_user_id = '';
                        }

                        var fromUserId = record.from_user_id;
                        if (fromUserId) {
                            return User.findOne({ id: fromUserId }).then(function (fromUser) {
                                if (fromUser) {
                                    record.from_user_id = fromUser.username;
                                }
                                else {
                                    record.from_user_id = '';
                                }
                            });
                        }
                    });
                }

            }).then(function () {
                var responseDate = ResponseUtil.addSuccessMessage();
                if (records && records.length != 0) {

                  var recordsCopy = ObjectUtil.cloneAttributes(records);
                  var filterRecords = [];
                  recordsCopy.map(function (value, index, array) {
                    filterRecords[index] = {};
                    for (var i in value) {
                      var attr = i.toString();
                      if (attr !== "uuid" && attr !== "createdAt" && attr!== "updatedAt") {
                        filterRecords[index][i] = value[i];
                      }
                    }
                  });

                    responseDate.total = filterRecords.length;
                    responseDate.results = filterRecords;
                    return res.json(responseDate);
                }
                else {
                    responseDate.total = 0;
                    responseDate.results = [];
                    return res.json(responseDate);
                }
            });
        });
    }
}

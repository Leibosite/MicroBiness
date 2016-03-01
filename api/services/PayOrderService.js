/**
 * Created by yinxin on 2015-11-2.
 */
var ResponseUtil = require('../util/ResponseUtil');
var Promise = require('bluebird');
var ObjectUtil = require('../util/ObjectUtil');

module.exports = {
    list: function (req, res) {
        PayOrder.find().then(function (records) {

            Promise.map(records, function (record) {

                var handlerUserId = record.handle_by;
                if (handlerUserId) {
                    return User.findOne({ id: handlerUserId }).then(function (handleUser) {
                        if (handleUser) {
                            record.handle_by = handleUser.username;
                        }
                        else {
                            record.handle_by = '';
                        }

                        var buyerUserId = record.user_id;
                        if (buyerUserId) {
                            return User.findOne({ id: buyerUserId }).then(function (buyerUser) {
                                if (buyerUser) {
                                    record.user_id = buyerUser.username;
                                }
                                else {
                                    record.user_id = '';
                                }

                                var storeInformationId = record.storeInformation;
                                if (storeInformationId) {
                                    return StoreInformation.findOne({ id: storeInformationId }).then(function (storeInformation) {
                                        if (storeInformation) {
                                            record.storeInformation = storeInformation.name;
                                        }
                                        else {
                                            record.storeInformation = '';
                                        }
                                    });
                                }
                            });
                        }
                    });
                }

            }).then(function () {
                var responseDate = ResponseUtil.addSuccessMessage();
                if (records && records.length != 0) {

                    var filterRecords = [];
                    var recordsCopy = ObjectUtil.cloneAttributes(records);
                    recordsCopy.map(function (value, index, array) {
                        filterRecords[index] = {};
                        for (var i in value) {
                            var attr = i.toString();
                            if (attr != 'uuid' && attr != 'createdAt' && attr!= 'updatedAt') {
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
};

/**
 * Order_recordController
 *
 * @description :: Server-side logic for managing order_records
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    list: function (req, res) {
        OrderRecordService.list(req, res);
    }
};


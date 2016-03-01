/**
 * PayOrderController
 *
 * @description :: Server-side logic for managing Payorder
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    list: function (req, res) {
        PayOrderService.list(req, res);
    }
};


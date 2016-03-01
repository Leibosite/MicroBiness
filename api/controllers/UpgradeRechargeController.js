/**
 * UpgradeRechargeController
 *
 * @description :: Server-side logic for managing upgraderecharges
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    list: function (req, res) {
        UpgradeRechargeService.list(req, res);
    }
};


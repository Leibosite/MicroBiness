/**
 * AddressController
 *
 * @description :: Server-side logic for managing addresses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
      mobileList: function (req,res) {
         var user_id = req.param('user_id');
        AddressService.list(user_id,res);
      },
      mobileUpdate:function(req,res){
        var id = req.param('id');
        var contact_number = req.param('contact_number');
        var name = req.param('name');
        var detail_address = req.param('detail_address');
        var is_default = req.param('is_default');
        //AddressService.updateAddress(id,contact_number,name,detail_address,is_default,res);
        if(is_default == 0)
          AddressService.updateAddress(id,contact_number,name,detail_address,is_default,res);
        else{
          AddressService.updateAddressOfDefault(id,contact_number,name,detail_address,is_default,res);
        }
      },
      mobileDelete:function(req,res){
        var id = req.param('id');
        AddressService.destroyAddress(id,res);
      },
      mobileCreate:function(req,res){
        var name = req.param('name');
        var detail_address = req.param('detail_address');
        var is_default = req.param('is_default');
        var contact_number = req.param('contact_number');
        var user_id = req.param('user_id');
        AddressService.createAddress(user_id,contact_number,name,detail_address,is_default,res);
      },
      mobileGetDefaultAddress:function(req,res){
        var user_id = req.param('user_id');
        AddressService.getAddressDetail(user_id,res);
      }

};


/**
 * Created by leibosite on 2015/8/20.
 */
var ResponseUtil = require('../util/ResponseUtil');
var ObjectUtil = require('../util/ObjectUtil');

 module.exports = {

   //return all of the user's addresses
   /**
    * 返回用户的所有地址
    * @param user_id
    * @param res
    */

   list:function(user_id,res){

     if(!user_id){
       return res.json(ResponseUtil.addParamNotRight());
     }

     User.findOne({id:user_id}).exec(function(err,user){
       if(err){
         return res.json(ResponseUtil.addErrorMessage());
       }
       if(!user){
         return res.json(ResponseUtil.addErrorMessage());
       }else{

         Address.find({
           where:{user:user.id,status:0},
           sort:{is_default:0,updatedAt:0}
       }).exec(function(err,addresses){

           var successData = ResponseUtil.addSuccessMessage();
           //sails.log.info(addresses);
           if(!addresses || addresses.length == 0 ) {
             successData.addresses = [];
             return res.json(successData);
           }

           //var addressesDate = [];
           //var defaultAddress ={};
           for(var i in addresses){
             for(var j in addresses[i]){

               var attr = j.toString();
               if(attr=="user"|| attr=="id"|| attr=="name"|| attr=="contact_number"
                 || attr=="detail_address" || attr=="is_default"){
                 continue;
               }
               delete  addresses[i][j];
             }
             var user_id = addresses[i].user;
             delete addresses[i].user;
             addresses[i].user_id = user_id;
           }

           successData.addresses = addresses;
           return res.json(successData);
         });

       }

     });
   },

   /**
    * 编辑用户的地址（不是默认地址）
    * @param id
    * @param contact_number
    * @param name
    * @param detail_address
    * @param is_default
    * @param res
    */
   updateAddress:function(id,contact_number,name,detail_address,is_default,res) {

     if(!id || !contact_number || !name || !detail_address || !is_default){
       sails.log.info("---------------修改地址信息检查出错----{param of address error:@}");
       sails.log.info(data);
       return res.json(ResponseUtil.addParamNotRight());
     }

     Address.update({id:id},{contact_number:contact_number,name:name,detail_address:detail_address,
       is_default:is_default})
       .exec(function afterword(err,result){
       //sails.log.info(result);
       if(err){
         sails.log.info("---------------更新地址出错----{update address error:@}");
         sails.log.error(err);
         return res.json(ResponseUtil.addErrorMessage());
       }
         sails.log.info("---------------结束更新地址----{updated address is:@}");
         sails.log.info(result);
       return res.json(ResponseUtil.addSuccessMessage());
     });
   },

   /**
    * 编辑用户的默认地址
    * @param id
    * @param contact_number
    * @param name
    * @param detail_address
    * @param is_default
    * @param res
    */
   updateAddressOfDefault: function (id,contact_number,name,detail_address,is_default,res) {

     if(!id || !contact_number || !name || !detail_address || !is_default){
       return res.json(ResponseUtil.addParamNotRight());
     }

     Address.findOne({id:id}).then(function(address){

       if(!address){
         return res.json(ResponseUtil.addErrorMessage());
       }

       for(var i in address){
         var attr = i.toString();
         if(attr=="contact_number") {
           address[i] = contact_number;
         }
         if(attr=="name") {
           address[i] = name;
         }
         if(attr=="detail_address"){
           address[i] = detail_address;
         }
         if(attr =="is_default") {
           address[i] = is_default;
         }
       }

       //sails.log.info(address);

       Address.count({user:address.user}).then(function(result){
         //sails.log.info(result);
         if(result == 1){

           address.save(function(err,result){
             if(err)return res.json(ResponseUtil.addErrorMessage());
             return res.json(ResponseUtil.addSuccessMessage());
           });
         }
         else if(result > 1){
           //sails.log.info("11111111111111111");
          return address.save(function(err,resultAddress){
             if(err)return res.json(ResponseUtil.addErrorMessage());
             //sails.log.info(result);
            Address.findOne({id:{'!':address.id},user:address.user,is_default:1}).then(function(oldAddress) {
              //sails.log.info("oldAddress");
              //sails.log.info(oldAddress);
              //sails.log.info("###############");
              if (oldAddress) {
                Address.update({id: oldAddress.id}, {is_default: 0}).then(function (result){
                  return res.json(ResponseUtil.addSuccessMessage());
                });
              }else{
                return res.json(ResponseUtil.addSuccessMessage());
              }

             });
           });
         }
       });
     }).catch(function (err) {
       if(err){
         sails.log.error(err);
         return res.json(ResponseUtil.addErrorMessage());
       }
     })
   },

   /**
    * 用户新增地址
    * @param user_id
    * @param contact_number
    * @param name
    * @param detail_address
    * @param is_default
    * @param res
    */
   createAddress:function(user_id,contact_number,name,detail_address,is_default,res){

     if(!user_id || !contact_number || !name || !detail_address || !is_default){
       return res.json(ResponseUtil.addParamNotRight());
     }

     User.findOne({id:user_id}).then(function (user) {

       if (!user) {
        throw new Error("ADDRESS_USER_NULL");
       }

       return Address.create({user:user.id,province:"",city:"",district:"",detail_address:detail_address,
           contact_number:contact_number,name:name,is_default:is_default}).then(function(newAddress){
           return newAddress;
         });

     }).then(function(newAddress){

       if(!newAddress){
         throw new Error("CREATE_NEW_ADDRESS_ERROR");
       }

      return Address.count({user:newAddress.user}).then(function (resultCount) {

        if(!resultCount){
          throw new Error("RESULT_COUNT_ERROR");
        }

         var isDefault;
         if(resultCount == 1){
           isDefault = 1;
         }else if(resultCount > 1){
           isDefault = 0;
         }

         return Address.update({id:newAddress.id},{is_default:isDefault}).then(function(result){

           if(!result){
             throw new Error("RESULT_UPDATE_ERROR");
           }

           return res.json(ResponseUtil.addSuccessMessage());
         })
       });
     }).catch(function(err){
       sails.log.error(err);
       return res.json(ResponseUtil.addErrorMessage());
     });
   },

   /**
    * 删除地址
    * @param id
    * @param res
    * @desp status = 0 表示正常 status = 1 表示已删除
    */
   destroyAddress: function (id,res) {
     if(!id){
       return res.json(ResponseUtil.addParamNotRight());
     }

     Address.findOne({id:id}).exec(function(err,address){
       if(err || !address){
         sails.log.error(err);
         return res.json(ResponseUtil.addErrorMessage());
       }

       //sails.log.info(address);

       Address.update({id:id},{is_default:0,status:1}).exec(function(err,addressResult){
         if(err){
           sails.log.error(err);
           return res.json(ResponseUtil.addErrorMessage());
         }
         if(!addressResult){
           return res.json(ResponseUtil.addErrorMessage());
         }
         return res.json(ResponseUtil.addSuccessMessage());
       });
     });
   },

   /**
    * 购物车界面上去结算接口
    * @param userId
    * @param res
    * @returns {*}
    */
   getAddressDetail:function(userId,res){
      if(!userId){
        return res.json(ResponseUtil.addParamNotRight());
      }
     Address.find({user: userId,status:0}).sort({is_default:0,updatedAt:0}).exec(function (err,addresses) {

       if(err){
         sails.log.error(err);
         return res.json(ResponseUtil.addErrorMessage());
       }
       var successData = ResponseUtil.addSuccessMessage();
       var addressResult = null;

       if(addresses.length != 0){
         addressResult = addresses[0];
         //var addressClone = ObjectUtil.cloneAttributes(addressResult);
         for(var i in addressResult){
           var attr = i.toString();
           if(attr=="id" || attr=="name" || attr=="contact_number"
             || attr=="detail_address" || attr == "is_default"){
             continue;
           }
           delete addressResult[i];
         }
       }
       successData.address = addressResult;
       return res.json(successData);
     });
   }
}

/**
 * Default model configuration
 * (sails.config.models)
 *
 * Unless you override them, the following properties will be included
 * in each of your models.
 *
 * For more info on Sails models, see:
 * http://sailsjs.org/#!/documentation/concepts/ORM
 */
var uuid = require('node-uuid');

function generateUUID(){
  return uuid.v4();
}

module.exports.models = {

    autoCreatedBy:false,

    attributes:{
        id:{
            type:'integer',
            primaryKey:true,
            unique:true,
            size:64,
            autoIncrement:true
        },
        uuid:{
            type:'string',
            size:36,
            unique:true,
            defaultsTo:generateUUID
        }
    },

    afterCreate:function(ObjectData,next){

      sails.log.info(this.adapter.identity);
      next();
    },



  /***************************************************************************
  *                                                                          *
  * Your app's default connection. i.e. the name of one of your app's        *
  * connections (see `config/connections.js`)                                *
  *                                                                          *
  ***************************************************************************/
    connection: 'MicroBusiness',

  /***************************************************************************
  *                                                                          *
  * How and whether Sails will attempt to automatically rebuild the          *
  * tables/collections/etc. in your schema.                                  *
  *                                                                          *
  * See http://sailsjs.org/#!/documentation/concepts/ORM/model-settings.html  *
  *                                                                          *
  ***************************************************************************/
    migrate: 'alter'

};

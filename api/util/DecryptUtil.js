/**
 * Created by jcy on 15/10/20.
 */

var moment = require('moment');

module.exports = {
  dateNumberToCompute: function () {
    var time = moment().format('YYYYMMDD');
    console.log(time);
    var number = parseInt(time);
    console.log(number);
    return number % 255;
  },

  decrypt:function(param){

    var len = param.length;
    var buffer = new Buffer(len/2);
    var numberToCompute = this.dateNumberToCompute();
    console.log(numberToCompute);
    for(var i=0;i<len;i= i+2){
      var temp = parseInt(param.substring(i,i+2),16);
      var number = temp ^ numberToCompute;
      buffer[i/2] = number;
    }


    return buffer.toString('UTF-8',0,buffer.length);

  },

  getPayPassword:function(str){
    return str.substring(6,str.length);
  },
  getToken : function (str) {
    return str.substring(0,6);
  }

};

/**
 * Created by jcy on 15/8/18.
 */
module.exports = {
  clone: function (obj) {
      var o,i,j;
      if(typeof(obj)!="object" || obj===null)return obj;
      if(obj instanceof(Array))
      {
          o=[];
          i=0;j=obj.length;
          for(;i<j;i++)
          {
              if(typeof(obj[i])=="object" && obj[i]!=null)
              {
                  o[i]=arguments.callee(obj[i]);
              }
              else
              {
                  o[i]=obj[i];
              }
          }
      }
      else
      {
            o = {};
            for(i in obj)
            {
              if(typeof(obj[i])=="object" && obj[i]!=null)
              {
                o[i]=arguments.callee(obj[i]);
              }
              else
              {
                o[i]=obj[i];
              }
            }
      }

      return o;
  },
  cloneAttributes:function(obj){
      var o,i,j;
      if(typeof(obj)!="object" || obj===null)return obj;
      if(obj instanceof(Array))
      {
          o=[];
          i=0;j=obj.length;
          for(;i<j;i++)
          {
              if(typeof(obj[i])=="object" && obj[i]!=null)
              {
                  o[i]=arguments.callee(obj[i]);
              }
              else
              {
                  if(typeof(obj[i])=="function"){
                      continue;
                  }else{
                      o[i]=obj[i];
                  }

              }
          }
      }
      else
      {

          if(obj instanceof Date){
            o = obj;
          }else {
            o = {};
            for (i in obj) {

              if (typeof(obj[i]) == "object" && obj[i] != null) {
                o[i] = arguments.callee(obj[i]);
              }
              else {
                if (typeof(obj[i]) == "function") {
                  continue;
                } else {
                  o[i] = obj[i];
                }
              }
            }
          }
      }

      return o;
  }
};

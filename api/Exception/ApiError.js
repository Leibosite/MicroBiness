/**
 * Created by tommy on 15/10/3.
 */

function WechatAccountError(message,code){
  this.code=code;
  this.message=message||"default info";
  this.name="WechatAccountError";
}
WechatAccountError.prototype=new Error();
WechatAccountError.prototype.constructor=WechatAccountError;

// api/models/Passport.js

var _ = require('lodash');
var _super = require('sails-permissions/api/models/Passport');
_super.attributes.user.size = 64;
_.merge(exports, _super);
_.merge(exports, {

    // Extend with custom logic here by adding additional fields, methods, etc.

});

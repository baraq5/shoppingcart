var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var order = new Schema({
      user:{
          type:Schema.Types.ObjectId,
          ref:'User'
      },
      cart:{
       type:Object,
       required:true
      },
      adress:{
          type:String,
          required:true
      },
      name:{
          type:String,
          required:true
      },
      paymentId:{
          type:String,
          required:true
      }
});

module.exports = mongoose.model('Order',order);
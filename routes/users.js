var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport= require('passport');
var Order = require('../models/order');
var Cart = require ('../models/cart');
var csrfProtection= csrf();
router.use(csrfProtection);

/* GET users listing. */


router.get('/profile',isLoggedIn,function(req,res){
  Order.find({user:req.user},function(err,orders){
      if(err){
        return res.write ('Error!');
      }
      var cart;
      orders.forEach(function(order){
         cart=new Cart(order.cart);
         order.items= cart.generaeArray();
      });
      res.render('user/profile',{orders:orders});
    });
  
});



router.get('/logout',isLoggedIn,function(req,res){
  req.logout();
  res.redirect('/');
});


router.use('/',notLoggedIn,function(req,res,next){
  next();
});
router.get('/signup', function(req,res){
  var messages=req.flash('error');
  res.render('user/signup',{csrfToken:req.csrfToken(),messages:messages ,haserror:messages.length>0});
});
router.post('/signup',passport.authenticate('local.signup',{
  failureRedirect:'/users/signup',
  failureFlash:true
}),function(req,res){
  if(req.session.oldUrl){
    var oldUrl =req.session.oldUrl;
    req.session.oldUrl=null;
    res.redirect(oldUrl);
 
  }else{
     res.redirect('/users/profile');
  }
});


router.get('/signin',function(req,res){
  var messages=req.flash('error');
  res.render('user/signin',{csrfToken:req.csrfToken(),messages:messages ,haserror:messages.length>0});
});

router.post('/signin',passport.authenticate('local.signin',{

  failureRedirect:'/users/signin',
  failureFlash:true
}),function(req,res){
  if(req.session.oldUrl){
    var oldUrl =req.session.oldUrl;
    req.session.oldUrl=null;
    res.redirect(oldUrl);
  }else{
     res.redirect('/users/profile');
  }
});




module.exports = router;


function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req,res,next){
  if(!req.isAuthenticated()){
    return next();
  }

}
var express = require('express');
var router = express.Router();
var stripe = require("stripe")("sk_test_ave146KqEsuHw8coL4ezOj9d");
var Product = require('../models/products');
var Cart = require ('../models/cart');
var Order = require('../models/order');


/* GET home page. */
router.get('/', function(req, res, next) {
  Product.find(function(err,docs){
    var productChunks=[];
    var chunkSize=3;
    for (var i=0;i<docs.length;i+=chunkSize){
      productChunks.push(docs.slice(i,i+chunkSize));
      
    }
    var errorMsg= req.flash('error')[0];
    var successMsg= req.flash('success')[0];
    res.render('index', { title: 'Movie Shopping', products:productChunks,successMsg:successMsg,noError:!successMsg,errorMsg:errorMsg,success:!errorMsg});
  });
  
});




router.get('/add-to-cart/:id',function(req,res){
 var productId=req.params.id;
 var cart = new Cart(req.session.cart ? req.session.cart:{});

 Product.findById(productId,function(err,product){
   if(err){
     return res.redirect('/');
   }
   cart.add(product,product.id);
   req.session.cart= cart;
   console.log(req.session.cart);
   res.redirect('/');
 });
  
});


router.get('/reduce/:id',function(req,res){
  var productId=req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart:{});
cart.reduceByOne(productId);
req.session.cart=cart;
res.redirect('/cart');
});


router.get('/remove/:id',function(req,res){
  var productId=req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart:{});
cart.removeItem(productId);
req.session.cart=cart;
res.redirect('/cart');
});


router.get('/cart',function(req,res){
  if(!req.session.cart){
    return res.render('cart',{products:null});
  }
  var cart=new Cart(req.session.cart);
  var Items=cart.totalQty;
  
  res.render('cart',{products:cart.generaeArray(),totalPrice:cart.totalPrice});
});


router.get('/checkout',isLoggedIn,function(req,res){
  if(!req.session.cart){
    return res.redirect('cart',{products:null});
  }
  var cart =new Cart(req.session.cart); 
  var errMsg= req.flash('error')[0];
  res.render('checkout',{total:cart.totalPrice,errMsg:errMsg,noError:!errMsg});
});



router.post('/checkout',isLoggedIn,function(req,res){

  if(!req.session.cart){
    return res.redirect('cart',{products:null});
  }
  var token = req.body.stripeToken; // Using Express
  
  // Charge the user's card:
  stripe.charges.create({
    amount: req.session.cart.totalPrice*100,
    currency: "usd",
    description: "Example charge",
    source: token,
  }, function(err, charge) {
    // asynchronously called
    if(err){
      req.flash('error',err.message);
      return res.redirect('/checkout');
    }
    var cart =req.session.cart;
    var order = new Order({
      user:req.user,
      cart: cart,
      adress:req.body.address,
      name:req.body.name,
      paymentId:charge.id
    });
    order.save(function(err,result){
        req.flash('success','Your product will be shipped to you with-in 7 days');
        req.session.cart=null;
        res.redirect('/');
    });
   
  });
});




module.exports = router;




function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  req.session.oldUrl=req.url;
  res.redirect('/users/signin');
}
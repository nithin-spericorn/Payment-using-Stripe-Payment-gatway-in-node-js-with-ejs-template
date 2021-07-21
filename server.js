if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const stripeSecretKey = process.env.STRIPE_SECRET_KEY||"sk_test_51JEuA2SDb2shNrKventisRZEGdj6zEhjcNMrvMjdBgEre6Z0Qn6k8GYUGYxWMDupAbc1phXTTWjbR3ucBuIHW8O800tlYG1srz"
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY||"pk_test_51JEuA2SDb2shNrKv8lX7A0Hx5BJIvCWUU7BPAqv58PeU1kBuTDP0uec9gsJjQTMF54IWnd40m629ykhgN18mq5gY00Y53mgaGG"
console.log(stripePublicKey,stripeSecretKey)

const express = require("express")
const app = express()
const fs = require("fs")
const { default: Stripe } = require('stripe')
const stripe = require("stripe")(stripeSecretKey)

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static('public'))

app.get('/store', function(req, res) {
  fs.readFile('items.json', function(error, data) {
    if (error) {
      res.status(500).end()
    } else {
      res.render('store.ejs', {
        stripePublicKey: stripePublicKey,
        items: JSON.parse(data)
      })
    }
  })
})

app.post('/purchase', function(req, res) {
  fs.readFile('items.json', function(error, data) {
    if (error) {
      res.status(500).end()
    } else {
      const itemsJson = JSON.parse(data)
      const itemsArray = itemsJson.music.concat(itemsJson.merch)
      let total = 0
      req.body.items.forEach(function(item) {
        const itemJson = itemsArray.find(function(i) {
          return i.id == item.id
        })
        total = total + itemJson.price * item.quantity
      })
      console.log(total)
      console.log( req.body.stripeTokenId)
      return stripe.customers.create({
        email:req.body.email,
        //source:req.body.stripeTokenId,
        name:"nithin p j",
        address:{
          line1:'abc',
          postal_code:'671532',
          city:'rajapuram',
          state:"kerala",
          country:"india"
        }
      }).then(
      stripe.charges.create({
        amount: total,
        source: req.body.stripeTokenId,
        currency: 'usd'
      })).then(function() {
        console.log('Charge Successful')
        res.json({ message: 'Successfully purchased items' })
      }).catch(function(error) {
        console.log('Charge Fail',error)
        res.status(500).end()
      })
    }
  })
})

const port = 4001
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
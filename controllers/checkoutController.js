app.post("/api/create-checkout-session", async (req, res) => {
  const { products } = req.body;
  console.log("🚀 ~ app.post ~ products:", products);

  // const lineItems = products.map((product)=>({
  //     price_data:{
  //         currency:"inr",
  //         product_data:{
  //             name:product.dish,
  //             images:[product.imgdata]
  //         },
  //         unit_amount:product.price * 100,
  //     },
  //     quantity:product.qnty
  // }));

  // const session = await stripe.checkout.sessions.create({
  //     payment_method_types:["card"],
  //     line_items:lineItems,
  //     mode:"payment",
  //     success_url:"http://localhost:3000/sucess",
  //     cancel_url:"http://localhost:3000/cancel",
  // });

  // res.json({id:session.id})
});

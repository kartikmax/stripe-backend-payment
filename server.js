require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3010",//cors value where the local env setupt
  })
);

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
//private key i.e secret key required 

const storeItems = new Map([
  [1, { priceInCents: 6900, name: "Basic Membership" }],
  [2, { priceInCents: 16900, name: "Pro Membership" }],
]);

app.post("/create-checkout-session", async (req, res) => {
  //route for the checkout session
  try {
    //api which returns the value 
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `http://localhost:3010`,//path when payment is successful
      cancel_url: `https://www.supportgenie.io`,//cancel url route
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



// app.post("/webhook", async (request, response) => {
//   const event = request.body;

//   // Handle the event
//   switch (event.type) {
//     case "payment_intent.succeeded":
//       const paymentIntent = event.data.object;
//       // Then define and call a method to handle the successful payment intent.
//       handlePaymentIntentSucceeded(paymentIntent);
//       break;
//     case "payment_method.attached":
//       const paymentMethod = event.data.object;
//       // Then define and call a method to handle the successful attachment of a PaymentMethod.
//       handlePaymentMethodAttached(paymentMethod);
//       break;
//     // ... handle other event types
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   // Return a response to acknowledge receipt of the event
//   response.json({ received: true });
// });

app.listen(3000);

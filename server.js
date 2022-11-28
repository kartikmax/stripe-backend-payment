require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3010",
  })
);

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const storeItems = new Map([
  [1, { priceInCents: 69000, name: "Basic Membership" }],
  [2, { priceInCents: 169000, name: "Pro Membership" }]
]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          // Image:
          //   "https://th.bing.com/th/id/R.f456795ad8a00a10608a3cc09fc8267a?rik=PyLfE2BKbsWOpg&riu=http%3a%2f%2fwww.fightersgeneration.com%2fnx4%2fchar%2flink-alinktothepast.png&ehk=e9uId2AtjWhPLTpqKLmu6PEtwhTkPK4Psib6UFYGtMQ%3d&risl=&pid=ImgRaw&r=0",
          price_data: {
            currency: "inr",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `http://localhost:5500/success.html`,
      cancel_url: `http://localhost:5500/cancel.html`,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000);

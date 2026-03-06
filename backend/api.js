const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const app = express();
const port = Number(process.env.PORT || 4242);
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4242";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Falta STRIPE_SECRET_KEY en variables de entorno.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20"
});

const PRODUCTS = [
  {
    id: "rose-delight",
    name: "Rose Delight",
    description: "Classic red roses with baby's breath and fern accents.",
    unit_amount: 32000,
    currency: "mxn",
    image:
      "https://source.unsplash.com/800x600/?rose,bouquet&sig=1",
    stripe_price_id: process.env.STRIPE_PRICE_ROSE_DELIGHT || null
  },
  {
    id: "sunny-day",
    name: "Sunny Day Mix",
    description: "Sunflowers, daisies, and yellow tulips for bright energy.",
    unit_amount: 28000,
    currency: "mxn",
    image:
      "https://source.unsplash.com/800x600/?sunflower,flowers&sig=2",
    stripe_price_id: process.env.STRIPE_PRICE_SUNNY_DAY || null
  },
  {
    id: "lavender-mist",
    name: "Lavender Mist",
    description: "Lavender stems, white lisianthus, and soft greenery.",
    unit_amount: 26000,
    currency: "mxn",
    image:
      "https://source.unsplash.com/800x600/?lavender,flowers&sig=3",
    stripe_price_id: process.env.STRIPE_PRICE_LAVENDER_MIST || null
  },
  {
    id: "peony-blush",
    name: "Peony Blush",
    description: "Pink peonies with eucalyptus and a romantic finish.",
    unit_amount: 39000,
    currency: "mxn",
    image:
      "https://source.unsplash.com/800x600/?peony,flowers&sig=4",
    stripe_price_id: process.env.STRIPE_PRICE_PEONY_BLUSH || null
  },
  {
    id: "white-elegance",
    name: "White Elegance",
    description: "White lilies and cream roses for elegant occasions.",
    unit_amount: 36000,
    currency: "mxn",
    image:
      "https://source.unsplash.com/800x600/?white,lily,flowers&sig=5",
    stripe_price_id: process.env.STRIPE_PRICE_WHITE_ELEGANCE || null
  },
  {
    id: "wild-garden",
    name: "Wild Garden",
    description: "Wildflower blend with colorful, natural texture.",
    unit_amount: 30000,
    currency: "mxn",
    image:
      "https://source.unsplash.com/800x600/?wildflowers,bouquet&sig=6",
    stripe_price_id: process.env.STRIPE_PRICE_WILD_GARDEN || null
  },
  {
    id: "tulip-sunrise",
    name: "Tulip Sunrise",
    description: "Coral, yellow, and white tulips in a bright arrangement.",
    unit_amount: 24000,
    currency: "mxn",
    image:
      "https://loremflickr.com/800/600/flower?lock=107",
    stripe_price_id: process.env.STRIPE_PRICE_TULIP_SUNRISE || null
  },
  {
    id: "orchid-luxe",
    name: "Orchid Luxe",
    description: "Violet orchids in a premium gift arrangement.",
    unit_amount: 40000,
    currency: "mxn",
    image:
      "https://loremflickr.com/800/600/orchid,flower?lock=108",
    stripe_price_id: process.env.STRIPE_PRICE_ORCHID_LUXE || null
  },
  {
    id: "pastel-bloom",
    name: "Pastel Bloom",
    description: "Pastel roses and carnations with elegant greenery.",
    unit_amount: 31000,
    currency: "mxn",
    image:
      "https://loremflickr.com/800/600/pastel,flowers?lock=109",
    stripe_price_id: process.env.STRIPE_PRICE_PASTEL_BLOOM || null
  },
  {
    id: "crimson-love",
    name: "Crimson Love",
    description: "Deep red roses for anniversaries and romantic moments.",
    unit_amount: 38000,
    currency: "mxn",
    image:
      "https://loremflickr.com/800/600/red,rose,flower?lock=110",
    stripe_price_id: process.env.STRIPE_PRICE_CRIMSON_LOVE || null
  },
  {
    id: "blue-harmony",
    name: "Blue Harmony",
    description: "Blue and white tones in a modern floral style.",
    unit_amount: 29000,
    currency: "mxn",
    image:
      "https://loremflickr.com/800/600/blue,flower?lock=111",
    stripe_price_id: process.env.STRIPE_PRICE_BLUE_HARMONY || null
  },
  {
    id: "golden-meadow",
    name: "Golden Meadow",
    description: "Sunflowers and yellow blossoms full of energy.",
    unit_amount: 27000,
    currency: "mxn",
    image:
      "https://loremflickr.com/800/600/yellow,flower?lock=112",
    stripe_price_id: process.env.STRIPE_PRICE_GOLDEN_MEADOW || null
  },
  {
    id: "velvet-night",
    name: "Velvet Night",
    description: "Wine and purple bouquet for a sophisticated gift.",
    unit_amount: 37000,
    currency: "mxn",
    image:
      "https://loremflickr.com/800/600/purple,flower?lock=113",
    stripe_price_id: process.env.STRIPE_PRICE_VELVET_NIGHT || null
  },
  {
    id: "blush-garden",
    name: "Blush Garden",
    description: "Soft pink seasonal bouquet with delicate style.",
    unit_amount: 25000,
    currency: "mxn",
    image:
      "https://loremflickr.com/800/600/pink,flower?lock=114",
    stripe_price_id: process.env.STRIPE_PRICE_BLUSH_GARDEN || null
  },
  {
    id: "fresh-breeze",
    name: "Fresh Breeze",
    description: "Fresh greens and white flowers with citrus vibe.",
    unit_amount: 23000,
    currency: "mxn",
    image:
      "https://loremflickr.com/800/600/white,flower?lock=115",
    stripe_price_id: process.env.STRIPE_PRICE_FRESH_BREEZE || null
  }
];

app.use(
  cors(
    (() => {
      const allowedOrigins = new Set(
        [
          frontendUrl,
          process.env.CORS_ALLOWED_ORIGINS || "",
          "http://localhost:4242",
          "http://127.0.0.1:4242",
          "http://localhost:3000",
          "http://127.0.0.1:3000"
        ]
          .flatMap((value) => value.split(","))
          .map((value) => value.trim())
          .filter(Boolean)
      );

      return {
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
          }
          return callback(new Error(`Origen no permitido: ${origin}`));
        },
        methods: ["GET", "POST", "OPTIONS"],
        credentials: false
      };
    })()
  )
);

app.set("trust proxy", 1);

const getPublicOrigin = (req) => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.replace(/\/+$/, "");
  }

  const proto =
    (req.headers["x-forwarded-proto"] || req.protocol || "http")
      .toString()
      .split(",")[0]
      .trim();
  const host = req.get("host");

  return host ? `${proto}://${host}` : "http://localhost:4242";
};

// El webhook de Stripe requiere el body crudo para validar la firma.
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res
        .status(500)
        .json({ error: "Falta STRIPE_WEBHOOK_SECRET en variables de entorno." });
    }

    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).send("Falta el encabezado stripe-signature.");
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (err) {
      return res.status(400).send(`Error de webhook: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("Checkout completado:", session.id, session.customer_email);
      // TODO: persistir orden en BD / activar fulfillment.
    }

    return res.json({ received: true });
  }
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "api-floreria" });
});

app.get("/api/config", (_req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null
  });
});

app.get("/api/products", (_req, res) => {
  res.json({ products: PRODUCTS });
});

app.post("/api/create-checkout-session", async (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  const qty = Number(quantity);

  if (!productId || Number.isNaN(qty) || qty < 1 || qty > 20) {
    return res.status(400).json({ error: "productId o cantidad invalidos." });
  }

  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado." });
  }

  try {
    const origin = getPublicOrigin(req);
    const successUrl =
      process.env.STRIPE_SUCCESS_URL ||
      `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = process.env.STRIPE_CANCEL_URL || `${origin}/cancel.html`;

    const lineItem = product.stripe_price_id
      ? {
          price: product.stripe_price_id,
          quantity: qty
        }
      : {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: product.description,
              images: product.image ? [product.image] : undefined
            },
            unit_amount: product.unit_amount
          },
          quantity: qty
        };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [lineItem],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        productId: product.id
      }
    });

    return res.json({
      checkoutUrl: session.url,
      sessionId: session.id
    });
  } catch (err) {
    console.error("Error al crear la sesion de checkout:", err);
    return res
      .status(500)
      .json({ error: "No se pudo crear la sesion de checkout." });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API de floreria escuchando en http://localhost:${port}`);
  });
}

module.exports = app;

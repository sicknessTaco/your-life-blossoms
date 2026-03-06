(() => {
  const resolveApiBase = () => {
    const fromData = document.body?.dataset?.apiBase?.trim();
    if (fromData) return fromData.replace(/\/+$/, "");

    // Local file previews do not have a valid HTTP origin for API calls.
    if (window.location.protocol === "file:") return "http://localhost:4242";

    return window.location.origin;
  };

  const apiBase = resolveApiBase();
  const statusEl = document.getElementById("shop-status");
  const featuredImageEl = document.getElementById("featured-image");
  const featuredTitleEl = document.getElementById("featured-title");
  const featuredDescriptionEl = document.getElementById("featured-description");
  const productCards = Array.from(document.querySelectorAll("[data-product-id]"));
  const productById = new Map();

  const formatPrice = (amount, currency) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: (currency || "mxn").toUpperCase()
    }).format((amount || 0) / 100);

  const setStatus = (message) => {
    if (statusEl) statusEl.textContent = message;
  };

  const updateFeatured = (product) => {
    if (!product) return;

    if (featuredTitleEl) featuredTitleEl.textContent = `Destacado: ${product.name}`;
    if (featuredDescriptionEl) featuredDescriptionEl.textContent = product.description;

    if (featuredImageEl && product.image) {
      featuredImageEl.style.opacity = "0.55";
      featuredImageEl.src = product.image;
      featuredImageEl.alt = product.name;
      requestAnimationFrame(() => {
        featuredImageEl.style.opacity = "1";
      });
    }
  };

  const startFeaturedRotation = (products) => {
    if (!products.length) return;

    let index = 0;
    updateFeatured(products[index]);

    if (products.length === 1) return;

    setInterval(() => {
      index = (index + 1) % products.length;
      updateFeatured(products[index]);
    }, 5000);
  };

  const updateCardFromProduct = (card, product) => {
    const title = card.querySelector("h3");
    const description = card.querySelector("p");
    const price = card.querySelector(".price");
    const image = card.querySelector("[data-product-image]");
    const button = card.querySelector(".buy-btn");

    if (title) title.textContent = product.name;
    if (description) description.textContent = product.description;
    if (price) price.textContent = formatPrice(product.unit_amount, product.currency);
    if (image && product.image) {
      image.src = product.image;
      image.alt = product.name;
    }
    if (button) button.disabled = false;
  };

  const getConfig = async () => {
    const response = await fetch(`${apiBase}/api/config`);
    if (!response.ok) throw new Error("No se pudo cargar /api/config.");
    return response.json();
  };

  const getProducts = async () => {
    const response = await fetch(`${apiBase}/api/products`);
    if (!response.ok) throw new Error("No se pudo cargar /api/products.");
    const data = await response.json();
    return data.products || [];
  };

  const createCheckoutSession = async (productId) => {
    const response = await fetch(`${apiBase}/api/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "No se pudo crear checkout.");
    }

    return response.json();
  };

  const init = async () => {
    try {
      if (!window.Stripe) {
        throw new Error("No se cargo Stripe.js.");
      }

      const [config, products] = await Promise.all([getConfig(), getProducts()]);

      if (!config.publishableKey) {
        throw new Error(
          "Falta STRIPE_PUBLISHABLE_KEY en backend. Configurala en tu .env."
        );
      }

      const stripe = window.Stripe(config.publishableKey);

      products.forEach((product) => productById.set(product.id, product));
      startFeaturedRotation(products);

      productCards.forEach((card) => {
        const productId = card.dataset.productId;
        const product = productById.get(productId);
        const button = card.querySelector(".buy-btn");

        if (!button || !product) return;
        updateCardFromProduct(card, product);

        button.addEventListener("click", async () => {
          button.disabled = true;
          const originalText = button.textContent;
          button.textContent = "Procesando...";

          try {
            const session = await createCheckoutSession(productId);
            if (session.sessionId) {
              await stripe.redirectToCheckout({ sessionId: session.sessionId });
              return;
            }

            if (session.checkoutUrl) {
              window.location.href = session.checkoutUrl;
              return;
            }

            throw new Error("Respuesta de checkout incompleta.");
          } catch (err) {
            console.error(err);
            setStatus(`Error: ${err.message}`);
            button.disabled = false;
            button.textContent = originalText;
          }
        });
      });

      setStatus("Catalogo listo. Compra habilitada con Stripe.");
    } catch (err) {
      console.error(err);
      setStatus(`Error de configuracion: ${err.message}`);
    }
  };

  init();
})();


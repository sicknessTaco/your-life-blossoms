(() => {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-url]");
    if (!trigger) return;

    const url = trigger.getAttribute("data-open-url");
    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  });

  const form = document.querySelector("[data-emailjs-form]");
  if (!form) return;

  const statusEl = form.querySelector("[data-form-status]");
  const sendBtn = form.querySelector("[data-send-btn]");

  const serviceId = form.dataset.emailjsServiceId;
  const templateId = form.dataset.emailjsTemplateId;
  const publicKey = form.dataset.emailjsPublicKey;

  const setStatus = (message, type = "info") => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove("is-error", "is-success");
    if (type === "error") statusEl.classList.add("is-error");
    if (type === "success") statusEl.classList.add("is-success");
  };

  const hasValidConfig = () =>
    serviceId &&
    templateId &&
    publicKey &&
    !serviceId.startsWith("TU_") &&
    !templateId.startsWith("TU_") &&
    !publicKey.startsWith("TU_");

  if (!window.emailjs) {
    setStatus("No se pudo cargar EmailJS.", "error");
    return;
  }

  if (!hasValidConfig()) {
    setStatus(
      "Configura tu SERVICE_ID, TEMPLATE_ID y PUBLIC_KEY en contacto.html.",
      "error"
    );
    return;
  }

  window.emailjs.init({
    publicKey
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = form.nombre.value.trim();
    const correo = form.correo.value.trim();
    const mensaje = form.mensaje.value.trim();

    if (!nombre || !correo || !mensaje) {
      setStatus("Completa todos los campos antes de enviar.", "error");
      return;
    }

    try {
      if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = "Enviando...";
      }
      setStatus("Enviando mensaje...");

      await window.emailjs.send(serviceId, templateId, {
        from_name: nombre,
        name: nombre,
        reply_to: correo,
        email: correo,
        message: mensaje,
        to_name: "Your Life Blossoms"
      });

      form.reset();
      setStatus("Mensaje enviado. Te responderemos pronto.", "success");
    } catch (error) {
      console.error("Error EmailJS:", error);
      setStatus("No se pudo enviar. Intenta de nuevo en unos minutos.", "error");
    } finally {
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = "Enviar mensaje";
      }
    }
  });
})();

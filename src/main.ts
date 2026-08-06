// src/main.ts
import "./style.css";
import type { Booking, NewBookingPayload } from "./models/booking";
import { generateBookingCardHtml } from "./components/BookingCard";
import { fetchBookings, createBooking, fetchAvailableEvents } from "./services/bookingService";

// -----------------------------------------------------------------------
// Selector de eventos: se puebla con la cartelera real de Ticketmaster,
// así el formulario solo permite reservar sobre eventos que existen.
// -----------------------------------------------------------------------
async function loadEventOptions(): Promise<void> {
  const select = document.getElementById("sel-evento") as HTMLSelectElement | null;
  if (select === null) return; // Guardia de nulidad

  select.disabled = true;
  select.innerHTML = `<option value="">Cargando eventos disponibles...</option>`;

  try {
    const events = await fetchAvailableEvents();

    if (events.length === 0) {
      select.innerHTML = `<option value="">No hay eventos disponibles</option>`;
      return;
    }

    const optionsHtml = events
      .map((event) => `<option value="${event.name}">${event.name} · ${event.localDate}</option>`)
      .join("");

    select.innerHTML = `<option value="" disabled selected>Selecciona un evento...</option>${optionsHtml}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido.";
    select.innerHTML = `<option value="">No se pudo cargar la cartelera</option>`;
    console.error("Fallo al cargar eventos disponibles:", message);
  } finally {
    select.disabled = false;
  }
}

// -----------------------------------------------------------------------
// Pilar 3: Arquitectura Asíncrona — carga del catálogo con feedback visual
// -----------------------------------------------------------------------
async function loadCatalog(): Promise<void> {
  const container = document.getElementById("contenedor-catalogo");
  if (container === null) return; // Guardia de nulidad

  container.innerHTML = `<p class="loading">Cargando reservas desde el servidor...</p>`;

  try {
    const bookings: Booking[] = await fetchBookings();

    if (bookings.length === 0) {
      container.innerHTML = `<p>No hay reservas registradas todavía.</p>`;
      return;
    }

    container.innerHTML = bookings
      .map((booking) => generateBookingCardHtml(booking))
      .join("");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido.";
    console.error("Fallo al cargar el catálogo:", message);
    container.innerHTML = `
      <div class="alerta-error">
        <p>No fue posible obtener las reservas.</p>
        <small>${message}</small>
      </div>
    `;
  }
}

// -----------------------------------------------------------------------
// Pilar 2: Manejo del DOM y Formularios
// -----------------------------------------------------------------------
function setupBookingForm(): void {
  const bookingForm = document.getElementById("form-reserva") as HTMLFormElement | null;
  if (bookingForm === null) return; // Guardia de nulidad

  bookingForm.addEventListener("submit", async (event: Event) => {
    event.preventDefault(); // Neutraliza el comportamiento nativo del navegador

    const eventSelect = document.getElementById("sel-evento") as HTMLSelectElement | null;
    const nameInput = document.getElementById("txt-nombre") as HTMLInputElement | null;
    const quantityInput = document.getElementById("txt-cantidad") as HTMLInputElement | null;
    const errorBlock = document.getElementById("bloque-error");

    if (eventSelect === null || nameInput === null || quantityInput === null) {
      return;
    }

    const eventValue = eventSelect.value.trim();
    const nameValue = nameInput.value.trim();
    const quantityValue = parseInt(quantityInput.value, 10);

    // Validaciones reactivas en el cliente
    if (eventValue.length === 0 || nameValue.length === 0 || isNaN(quantityValue) || quantityValue <= 0) {
      if (errorBlock !== null) {
        errorBlock.textContent = "Error: selecciona un evento real y completa los demás campos.";
      }
      return;
    }

    if (errorBlock !== null) {
      errorBlock.textContent = "";
    }

    const submitButton = bookingForm.querySelector("button[type='submit']") as HTMLButtonElement | null;
    const originalLabel = submitButton?.textContent ?? "Emitir reserva";

    const payload: NewBookingPayload = {
      eventName: eventValue,
      customerName: nameValue,
      quantity: quantityValue,
    };

    try {
      if (submitButton !== null) {
        submitButton.disabled = true;
        submitButton.textContent = "Guardando...";
      }

      await createBooking(payload);
      bookingForm.reset();
      await loadCatalog(); // Refresca la cartelera con el nuevo dato
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido.";
      if (errorBlock !== null) {
        errorBlock.textContent = `Error al reservar: ${message}`;
      }
    } finally {
      if (submitButton !== null) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
    }
  });
}

function setupReloadButton(): void {
  const reloadButton = document.getElementById("btn-recargar");
  if (reloadButton === null) return; // Guardia de nulidad

  reloadButton.addEventListener("click", () => {
    void loadCatalog();
  });
}

// -----------------------------------------------------------------------
// Punto de entrada
// -----------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  setupBookingForm();
  setupReloadButton();
  void loadEventOptions();
  void loadCatalog();
});

// src/components/BookingCard.ts
import type { Booking } from "../models/booking";
import { BookingStatus } from "../models/booking";

/**
 * Traduce el enum a una etiqueta legible + clase CSS,
 * evitando comparaciones con strings sueltos en la UI.
 */
function getStatusMeta(status: BookingStatus): { label: string; cssClass: string } {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return { label: "Confirmada", cssClass: "status-confirmed" };
    case BookingStatus.CANCELLED:
      return { label: "Cancelada", cssClass: "status-cancelled" };
    case BookingStatus.PENDING:
    default:
      return { label: "Pendiente", cssClass: "status-pending" };
  }
}

/**
 * Genera el HTML de una tarjeta de reserva a partir de un objeto Booking tipado.
 */
export function generateBookingCardHtml(booking: Booking): string {
  const { label, cssClass } = getStatusMeta(booking.status);
  const shortId = booking.id.replace("bk-", "").slice(-6).toUpperCase();

  return `
    <article class="ticket ${cssClass}">
      <div class="ticket-body">
        <div class="ticket-top">
          <h3 class="ticket-event">${booking.eventName}</h3>
          <span class="stub-status">${label}</span>
        </div>
        <p class="ticket-name">${booking.customerName}</p>
      </div>
      <div class="ticket-tear"></div>
      <div class="ticket-stub">
        <div>
          <span class="stub-label">Entradas</span>
          <span class="stub-value">${booking.quantity}</span>
        </div>
        <div>
          <span class="stub-label">Folio</span>
          <span class="stub-value stub-id">${shortId}</span>
        </div>
      </div>
    </article>
  `;
}

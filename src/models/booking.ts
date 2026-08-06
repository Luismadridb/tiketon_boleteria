// src/models/booking.ts

/**
 * Enumeración estricta para controlar los estados de una reserva.
 * Prohibido usar strings libres para representar estados críticos.
 */
export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

/**
 * Contrato de datos hermético para una reserva.
 * Sin propiedades sueltas
 */
export interface Booking {
  id: string;
  eventName: string;
  customerName: string;
  quantity: number;
  status: BookingStatus;
}

/**
 * Payload que envía el formulario del cliente al crear una reserva nueva.
 * Se separa de Booking porque el id y el status los asigna el "servidor".
 */
export interface NewBookingPayload {
  eventName: string;
  customerName: string;
  quantity: number;
}

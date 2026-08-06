// src/services/bookingService.ts
import type { Booking, NewBookingPayload } from "../models/booking";
import { BookingStatus } from "../models/booking";

const TICKETMASTER_ENDPOINT = "https://app.ticketmaster.com/discovery/v2/events.json";

// ---------------------------------------------------------------------
// Reservas locales (simuladas): lo que el usuario crea desde el formulario.
// Ticketmaster no expone un endpoint público para crear reservas reales,
// así que esta parte sigue siendo una "base de datos" en memoria.
// ---------------------------------------------------------------------
let localBookings: Booking[] = [];

function simulateNetworkDelay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------
// Tipos mínimos de la respuesta de Ticketmaster (solo lo que usamos).
// ---------------------------------------------------------------------
interface TicketmasterVenue {
  name: string;
}

interface TicketmasterEvent {
  id: string;
  name: string;
  dates: {
    start: {
      localDate: string;
    };
  };
  _embedded?: {
    venues?: TicketmasterVenue[];
  };
}

interface TicketmasterResponse {
  _embedded?: {
    events?: TicketmasterEvent[];
  };
}

/**
 * Opción de evento real lista para poblar el <select> del formulario.
 */
export interface EventOption {
  id: string;
  name: string;
  venueName: string;
  localDate: string;
}

/**
 * Llamada base compartida a la Discovery API. Centraliza el manejo de
 * errores (key faltante, red caída, HTTP no-ok) para que tanto el
 * catálogo como el selector de eventos usen exactamente la misma lógica.
 */
async function fetchTicketmasterEvents(): Promise<TicketmasterEvent[]> {
  const apiKey = import.meta.env.VITE_TICKETMASTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Falta configurar VITE_TICKETMASTER_API_KEY en tu archivo .env (ver .env.example)."
    );
  }

  const url = `${TICKETMASTER_ENDPOINT}?apikey=${apiKey}&countryCode=CL&size=8`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error("No hay conexión con Ticketmaster. Revisa tu red e inténtalo de nuevo.");
  }

  if (!response.ok) {
    throw new Error(`Ticketmaster respondió con error HTTP ${response.status}.`);
  }

  const data = (await response.json()) as TicketmasterResponse;
  return data._embedded?.events ?? [];
}

/**
 * Convierte un evento real de Ticketmaster al modelo Booking de la app.
 * Nota: Ticketmaster no entrega "cliente" ni "cantidad reservada" (no es
 * una reserva real), así que se usan como vitrina informativa: la fecha
 * y el recinto quedan en customerName, y quantity queda en 1 como
 * marcador de "evento publicado" (no de entradas reservadas).
 */
function mapTicketmasterEvent(event: TicketmasterEvent): Booking {
  const venueName = event._embedded?.venues?.[0]?.name ?? "Recinto por confirmar";

  return {
    id: `tm-${event.id}`,
    eventName: event.name,
    customerName: `${venueName} · ${event.dates.start.localDate}`,
    quantity: 1,
    status: BookingStatus.CONFIRMED,
  };
}

/**
 * Trae cartelera real desde la API pública de Ticketmaster (Discovery API)
 * y la combina con las reservas locales creadas desde el formulario.
 */
export async function fetchBookings(): Promise<Booking[]> {
  const events = await fetchTicketmasterEvents();
  const realBookings = events.map(mapTicketmasterEvent);
  return [...localBookings, ...realBookings];
}

/**
 * Trae la lista de eventos reales para poblar el <select> del formulario,
 * de modo que el usuario solo pueda reservar sobre eventos que existen
 * de verdad en la cartelera de Ticketmaster.
 */
export async function fetchAvailableEvents(): Promise<EventOption[]> {
  const events = await fetchTicketmasterEvents();

  return events.map((event) => ({
    id: event.id,
    name: event.name,
    venueName: event._embedded?.venues?.[0]?.name ?? "Recinto por confirmar",
    localDate: event.dates.start.localDate,
  }));
}

/**
 * Simula una llamada POST para crear una reserva nueva (queda solo local).
 * El eventName llega ya validado desde el <select>, así que siempre
 * corresponde a un evento real existente en la cartelera.
 */
export async function createBooking(payload: NewBookingPayload): Promise<Booking> {
  await simulateNetworkDelay(600);

  if (payload.quantity <= 0) {
    throw new Error("La cantidad debe ser mayor a cero.");
  }

  const newBooking: Booking = {
    id: `bk-${Date.now()}`,
    eventName: payload.eventName,
    customerName: payload.customerName,
    quantity: payload.quantity,
    status: BookingStatus.PENDING,
  };

  localBookings = [newBooking, ...localBookings];
  return newBooking;
}

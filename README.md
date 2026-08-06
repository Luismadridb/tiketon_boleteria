# La Boletería — Tiketón
Es una interfaz dinámica inspirada en una boletería de eventos: el catálogo se llena con cartelera real obtenida desde
la **Discovery API de Ticketmaster**, y el usuario puede emitir reservas sobre esos eventos
reales desde un formulario con validación y feedback visual de carga.

## Tecnologías

- **TypeScript Vanilla** (sin frameworks de UI)
- **Vite** como bundler y servidor de desarrollo
- Módulos nativos de ES (`import`/`export`)
- **Ticketmaster Discovery API** para la cartelera de eventos real

## Instalación y ejecución

Instalar dependencias:

```bash
npm install
```

Configurar tu API key (ver sección siguiente), y luego ejecutar el servidor de desarrollo:

```bash
npm run dev
```

Ejecutar la verificación de tipos de TypeScript (build):

```bash
npm run build
```

## Configurar la API de Ticketmaster

Esta app consume la [Discovery API de Ticketmaster](https://developer.ticketmaster.com/)
para mostrar eventos reales. Necesitas tu propia API key gratuita:

1. Crea una cuenta en [developer.ticketmaster.com](https://developer.ticketmaster.com/).
2. En "My Apps" copia el valor de **Consumer Key** (esa es tu API key).
3. Copia `.env.example` como `.env` en la raíz del proyecto:
```bash
   cp .env.example .env
```
4. Pega tu key en `.env`:


5. Reinicia `npm run dev` (Vite solo lee `.env` al arrancar).

Si la key falta o es inválida, la app no se rompe: muestra un mensaje de error controlado
en pantalla gracias al manejo de errores con `try/catch`.

## Estructura del proyecto

src/
├── models/
│ └── booking.ts # Interfaces y enum estrictos (Pilar 1)
├── components/
│ └── BookingCard.ts # Renderizado del talón (ticket) a partir del modelo
├── services/
│ └── bookingService.ts # Consumo real de Ticketmaster + reservas simuladas
├── main.ts # Manejo del DOM, formularios y orquestación
├── style.css # Sistema de diseño "boletería" (marquesina + talones)
└── vite-env.d.ts # Tipado de variables de entorno (VITE_TICKETMASTER_API_KEY)


## Cómo funciona el consumo de la API

- **Catálogo (`fetchBookings`)**: trae eventos reales desde Ticketmaster con `fetch` +
  `async/await`, valida `response.ok`, y maneja tanto fallos de red como respuestas HTTP
  no exitosas con mensajes descriptivos en pantalla.
- **Selector de eventos (`fetchAvailableEvents`)**: puebla el `<select>` del formulario con
  la misma cartelera real, para que solo se pueda reservar sobre eventos que existen de
  verdad — no texto libre inventado.
- **Reservas (`createBooking`)**: como Ticketmaster no expone un endpoint público para crear
  reservas reales, esta parte queda simulada en memoria (con `async/await` y delay
  artificial), pero siempre referencia un evento real elegido en el selector.

## Características implementadas

- **Modelado estricto**: entidades `Booking` y estados `BookingStatus` tipados con
  `interface` y `enum`, sin uso de `any` en ningún archivo del proyecto (incluyendo los
  tipos propios para la respuesta de Ticketmaster).
- **DOM seguro**: captura de nodos con guardias de nulidad, `preventDefault()` en el
  formulario y extracción de datos con aserciones (`as HTMLInputElement`,
  `as HTMLSelectElement`).
- **Asincronía controlada**: funciones `async/await` con bloques `try/catch`, validación
  de errores reales de red/HTTP, y estados visuales de carga/error en pantalla tanto para
  el catálogo como para el selector de eventos.# tiketon_boleteria

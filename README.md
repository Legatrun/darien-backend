# Sistema de Gestión de Reservas y Monitoreo IoT

Este proyecto implementa un backend en Node.js/Express para gestionar reservas de espacios de trabajo y monitorear condiciones ambientales mediante IoT.

## Requisitos Previos

- Docker y Docker Compose
- Node.js v18+ (si se ejecuta localmente sin Docker)

## Configuración y Ejecución

1.  **Clonar el repositorio**
2.  **Variables de Entorno**: Copia `.env.example` a `.env` y ajusta si es necesario.
    ```bash
    cp .env.example .env
    ```
3.  **Ejecutar con Docker Compose**:
    ```bash
    docker-compose up --build
    ```
    Esto levantará la API en `http://localhost:3000`, la base de datos MySQL y el broker MQTT Mosquitto.

## Endpoints Principales

**Autenticación**: Todos los endpoints requieren el header `X-API-Key: secret-api-key-123` (configurable en .env).

-   `POST /api/espacios`: Crear espacio.
-   `POST /api/reservas`: Crear reserva.
-   `GET /api/reservas`: Listar reservas (paginado).
-   `POST /api/espacios/:id/desired`: Configurar dispositivo IoT.
-   `GET /api/espacios/:id/status`: Ver estado del Gemelo Digital y alertas.

## Pruebas

Para ejecutar los tests unitarios y de integración:

```bash
npm test
```

(Asegúrate de tener una base de datos disponible o configurar el entorno de test correctamente, aunque los tests intentan usar una DB en memoria o local si se configura sqlite, por defecto usa mysql según config).

## Desnormalización de `lugarId` en Reserva

Se ha incluido el campo `lugarId` en la tabla `Reserva` como una desnormalización intencional.
**Justificación**: Permitir consultas rápidas de todas las reservas de un "Lugar" (Edificio/Sede) sin necesidad de hacer un JOIN costoso con la tabla `Espacio` cada vez. Esto optimiza los reportes a nivel de sede.

## Bonus IoT: Reglas de Alerta

El sistema implementa 3 reglas de alerta en `services/AlertService.js`:
1.  **CO2**: Alerta si > threshold por 5 min.
2.  **Ocupación Máxima**: Alerta si > capacidad por 2 min.
3.  **Ocupación Inesperada**: Alerta si hay ocupación fuera de horario o sin reserva.

Para probarlas, puedes publicar mensajes MQTT al tópico `sites/{siteId}/offices/{officeId}/telemetry` con el siguiente formato JSON:
```json
{
  "temp_c": 22,
  "humidity_pct": 50,
  "co2_ppm": 1200,
  "occupancy": 5,
  "power_w": 100
}
```

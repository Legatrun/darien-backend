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

-   `POST /api/spaces`: Crear espacio.
-   `POST /api/reservations`: Crear reserva.
-   `POST /api/spaces/:id/desired`: Configurar dispositivo IoT.
-   `GET /api/spaces/:id/status`: Ver estado del Gemelo Digital y alertas.

## Pruebas

Para ejecutar los tests unitarios y de integración:

```bash
npm test
```

(Asegúrate de tener una base de datos disponible o configurar el entorno de test correctamente, aunque los tests intentan usar una DB en memoria o local si se configura sqlite, por defecto usa mysql según config).

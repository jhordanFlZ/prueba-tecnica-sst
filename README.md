# SuperApp SST

Aplicación de gestión de Salud y Seguridad en el Trabajo construida con Vue 3, Tailwind, Express, NestJS, Prisma y MariaDB.

## Arquitectura

```text
Vue 3 + Tailwind (5173)
        │
        ▼
Express API Gateway (3000)
        │  JWT, CORS, Helmet, rate limit
        ▼
NestJS + Prisma (3001)
        │  RBAC, casos de uso, correlación de alertas
        ▼
MariaDB / pruebaTecnica (3307)
```

Todas las peticiones del frontend pasan por el API Gateway. El backend valida nuevamente el JWT y los permisos antes de consultar datos.

## Estructura del repositorio

```text
frontend/
└── src/
    ├── components/       Componentes reutilizables de navegación y tablas
    ├── modules/          Tipos agrupados por dominio
    ├── services/         Cliente HTTP hacia el Gateway
    ├── views/            Pantallas de login, resumen y módulos SST
    ├── *.css             Estilos base y estilos específicos por módulo
    └── App.vue           Composición de navegación y sesión

apigateway/
└── src/
    ├── config/           Variables de entorno
    ├── middleware/       Autenticación en la frontera
    ├── routes/           Proxy de rutas hacia NestJS
    └── server.ts         Arranque del Gateway

Backend/
├── prisma/
│   ├── migrations/       Historial versionado de la base de datos
│   ├── schema.prisma     Modelo entidad-relación
│   └── import-csv.ts     Carga y normalización de fuentes CSV
└── src/
    ├── core/database/    Cliente Prisma
    ├── modules/auth/     Login, JWT y autorización RBAC
    ├── modules/dashboard Métricas, recursos y expedientes
    ├── modules/alerts/   Motor de correlación y alertas
    ├── modules/etl/      Normalización de datos
    └── shared/            Tipos compartidos
```

## Inicio local

Requisitos: Node.js 20+, pnpm, Docker Desktop y MariaDB.

```bash
docker compose up -d mariadb

cd Backend
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm run start:dev

cd ../apigateway
pnpm install
pnpm run dev

cd ../frontend
pnpm install
pnpm run dev
```

La conexión de desarrollo se configura en `Backend/.env`:

```env
DATABASE_URL="mysql://sst_user:sst_password@127.0.0.1:3307/pruebaTecnica"
```

## Módulos y permisos

| Rol | Alcance |
|---|---|
| HRBP / Líder / Relaciones Laborales | Métricas agregadas, ausentismo por área y conteos. No recibe diagnósticos ni historias clínicas. |
| Médico Ocupacional / Admin SST | Colaboradores, incapacidades, diagnósticos, CIE-10, encuestas, expedientes, alertas y casos individuales. |

La interfaz oculta módulos no autorizados, pero la protección principal está implementada en los guards RBAC del backend.

## Pilares funcionales

- **Correlación y alertas:** cruza incapacidades y encuestas en una ventana de 60 días. Marca riesgo alto ante incapacidades repetitivas, síntomas recurrentes o solicitudes médicas recurrentes.
- **Dashboard:** muestra casos activos/cerrados, ausentismo por área y alertas. Se actualiza automáticamente cada 30 segundos.
- **Expedientes:** disponible únicamente para Médico y Admin SST, con búsqueda y paginación de 10 registros.

## Base de datos

La migración inicial se encuentra en `Backend/prisma/migrations/20260909000000_init/migration.sql` y crea:

`User`, `Employee`, `Absence`, `SymptomReport`, `MedicalCase` y `Alert`.

Credenciales demo:

```text
hrbp@sst.local / Demo123!
medico@sst.local / Demo123!
admin@sst.local / Demo123!
```

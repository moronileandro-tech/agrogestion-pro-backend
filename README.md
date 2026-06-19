# AgroGestión Pro — Backend

API del sistema de gestión para Estancia La Criolla.

## Qué es esto
Backend del módulo de Ganadería: autenticación, listado de animales, fichas individuales, eventos sanitarios.

## Variables de entorno necesarias (Railway las completa la mayoría automáticamente)
- `DATABASE_URL` — la genera Railway al conectar la base PostgreSQL
- `JWT_SECRET` — un texto largo y aleatorio, Railway puede generarlo
- `PORT` — Railway lo asigna automáticamente

## Usuario de prueba (después de correr el seed)
- Email: `admin@lacriolla.com.ar`
- Contraseña: `campo2025`

## Cómo se despliega
1. Conectar este repositorio en Railway
2. Agregar un servicio de PostgreSQL en el mismo proyecto de Railway
3. Railway instala dependencias y corre las migraciones automáticamente
4. Correr una vez `npm run seed` desde la consola de Railway para crear el usuario admin

# TURNOFA | Agenda Inteligente para Estética de Pies

Plataforma de agenda y recepción exclusiva para estética de pies, pedicuría clínica y spa podológico. Desarrollada con Next.js 16 (App Router), TypeScript, Tailwind CSS, Google Gemini y Supabase.

Dominio oficial: [turnofacilia.online](https://turnofacilia.online) · Despliegue en Vercel: [turnofacil-ai.vercel.app](https://turnofacil-ai.vercel.app)

---

## Características Principales

1. **Identidad Exclusiva de Recepción (TURNOFA)**:
   - Marca, logotipo podológico y paleta de colores limpia y relajante (tonos verde menta, teal, jade y blanco).
   - Eliminación total de e-commerce o pasarelas ajenas; enfoque 100% en la gestión de turnos de estética de pies.

2. **Acceso Designado de Recepción**:
   - Acceso con credenciales designadas:
     - **Gmail**: `gm89168@gmail` (o `gm89168@gmail.com`)
     - **Contraseña**: `Cmd123`
   - Sesión protegida y persistente para la recepcionista.

3. **Directorio y Gestión de Clientes**:
   - Registro de datos clave: **Nombre y Apellido, DNI, Teléfono (con enlace directo a WhatsApp) y Gmail**.
   - Búsqueda instantánea en tiempo real por cualquiera de los campos.

4. **Calendario y Agenda Podológica**:
   - Filtros por día (Hoy, Mañana, Todos).
   - Servicios podológicos especializados con precios y duraciones predefinidas:
     - *Belleza y Spa de Pies Deluxe* (50 min)
     - *Pedicuría Clínica & Talones Agrietados* (45 min)
     - *Tratamiento de Uña Encarnada / Onicocriptosis* (40 min)
     - *Esmaltado Semipermanente de Pies* (45 min)
     - *Reflexología Podal y Masaje Descongestivo* (35 min)
     - *Reconstrucción Ungueal Podológica* (30 min)
   - Estados de turno: Confirmado, En atención, Completado, Cancelado.

5. **Automatización de Recordatorios por Gmail**:
   - **Recordatorio 24 horas antes**: Notifica al cliente el día previo para confirmar su asistencia y sugiere asistir con calzado cómodo/sandalias.
   - **Recordatorio en el momento del turno**: Avisa al cliente que su box de podología y especialista están listos.
   - Plantilla HTML profesional con el logo y branding de TURNOFA, fecha, hora, dirección y recomendaciones de salud podológica.

6. **Asistente IA Integrado (Gemini)**:
   - Chat inteligente para la recepción que responde consultas de disponibilidad, busca clientes, lista servicios y redacta mensajes personalizados para correo o WhatsApp.

7. **Base de Datos (Supabase)**:
   - Tablas `clientes`, `turnos_estetica` y `recordatorios_log`.
   - Archivo de migración versionado en `supabase/migrations/20261010000000_turnofa_estetica_pies.sql`.
   - Almacén resiliente con soporte de sincronización y fallback de alta disponibilidad.

---

## Ejecución Local

```bash
# Instalar dependencias
npm install

# Compilar para producción
npm run build

# Iniciar servidor
npm run start
```

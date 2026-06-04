# Webding

App React + Vite para crear paginas web de boda con login, editor visual, preview, template inicial y confirmacion por WhatsApp.

## Ejecutar

```bash
npm install
npm run dev
```

La app queda en `http://127.0.0.1:5173`.

## Supabase

El cliente ya apunta al proyecto:

```env
VITE_SUPABASE_URL=https://wyghdpkxhpxnqomosivh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_8Mgp0j-3NCI-1utNM50F1A_kcx8cqMy
```

Crea las tablas copiando el contenido de `supabase-schema.sql` en el SQL editor de Supabase. Incluye:

- `wedding_pages`: paginas de boda por usuario, slug publico, estado y configuracion JSON.
- `wedding_rsvps`: confirmaciones futuras asociadas a una pagina.
- Bucket publico `wedding-images` para fotos de invitaciones.
- Row Level Security para que cada usuario gestione sus paginas y cualquier visitante pueda ver paginas publicadas.
- Politicas de Storage para que cada usuario suba, edite o borre solo imagenes dentro de su carpeta `auth.uid()`.

Si las tablas aun no existen, el editor guarda un respaldo local en `localStorage` para probar la experiencia mientras completas Supabase.

## Flujo actual

- Landing de marketing.
- Login / registro con Supabase Auth.
- Dashboard/perfil con listado de invitaciones, estado, ID corto, liga publica estilizada y acciones.
- 8 templates: Quincy Romance, Linen Atelier, Modern Luxe, Grand Ballroom, Terracotta Sunset, Coastal Vows, City Hall Chic y Desert Editorial.
- 10 temas de 5 colores: principal, acento, fondo, superficie y texto.
- Personalizacion de nombres, fecha, ubicacion con link directo de Google Maps, palabras, tipografia, musica, WhatsApp internacional, fotos, contador, sobre/regalo y code dress.
- Template personalizado con ajustes de tamano de hero, estilo de galeria y orden de secciones.
- Contador con dias, horas, minutos y segundos en varios estilos visuales.
- Galeria bento responsive por template, con reacomodo cuando hay menos fotos.
- Texto final de la invitacion editable u ocultable.
- Cancion principal y playlist de boda en secciones separadas con embeds de Spotify, opcion de autoplay para la cancion y control de pausa/reproduccion.
- Fotos por URL o upload a Supabase Storage con preview inmediato.
- Sobre/regalo con opcion de link para deposito o mesa de regalos.
- Code dress independiente con activo/inactivo.
- Preview en vivo de la invitacion.
- Ruta publica por slug: `#/i/ana-y-david`.

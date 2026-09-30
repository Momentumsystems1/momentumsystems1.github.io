MOMENTUM SYSTEMS — V12 SAAS PREMIUM PORTAL

Archivos a reemplazar/subir:
- client-area.html
- index.html
- assets/css/client-portal.css
- assets/css/main.css
- assets/js/client-portal.js
- assets/js/main.js
- assets/js/supabase-auth.js
- assets/js/portal-saas.js   <-- nuevo

Además, ejecutar en Supabase:
- supabase/portal-saas-schema.sql

Orden recomendado:
1) Subir/reemplazar archivos en el servidor.
2) Verificar que assets/js/supabase-auth.js mantiene:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
3) En Supabase > SQL Editor, ejecutar supabase/portal-saas-schema.sql.
4) En Supabase > Authentication > Providers, activar Google y Azure/Microsoft.
5) En Authentication > URL Configuration, añadir redirects:
   - https://TU-DOMINIO/index.html?portal=login&sso=callback
   - URL temporal si sigues usando workers/pages.
6) Abrir la web en incógnito y probar login + portal.

Qué añade:
- Live client desk con mensajería preparada para Supabase Realtime.
- Chatbot Momentum Copilot con respuestas rápidas de proceso.
- Audit trail de actividad.
- Tarjetas SaaS premium: SSO, Realtime, RLS, AI desk.
- Fallback local si el SQL aún no se ha ejecutado.
- Eliminación de lenguaje de break-even/payback no validado.

Nota importante:
La mensajería del cliente queda preparada. Para que un gestor de Momentum responda desde una interfaz interna, el siguiente paso sería crear un mini panel gestor privado o una Edge Function con service role.
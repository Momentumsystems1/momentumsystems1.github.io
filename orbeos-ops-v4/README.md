# ORBEOS OPS v4 — Map-first / Orbital UI

Aislado de los despliegues de Road Command Center / Render. La UI es un prototipo independiente; no se conecta a la API de Google Maps.

## Mapas
- Mapa principal: MapLibre GL 4.7.1; cartografía CARTO/OSM (nocturna y clara), satélite Esri. La carga de la librería intenta jsDelivr y después unpkg.
- Si falla el motor WebGL o los CDN se intenta una vista raster de emergencia, con aviso explícito cuando las teselas tampoco son accesibles. La vista de emergencia no ofrece toda la funcionalidad del motor principal.
- Miniaturas multizona: imágenes raster CARTO, sin mapas WebGL por zona. No representan transmisiones GPS en tiempo real.
- Google Maps requerirá una API key configurada de forma segura, facturación, habilitar APIs y permiso de uso; no está incorporado.

## Orbe
- Clic centro: abrir/cerrar jerarquía.
- Doble clic: reducir el núcleo.
- Primera órbita: zonas, mapa, rutas, capas, alertas, fuentes, interfaz.
- Segunda órbita: acciones reales y opciones de composición de interfaz (menú, KPIs, panel, zonas, ajustes).
- Arrastrar centro: mover el orbe dentro del mapa.

## Estado de datos
Los indicadores de flota no son reales; aparecen como DEMO. Las conexiones API solo aparecen como disponibles tras verificación. La ocupación de plazas y seguimiento de vehículos no se infieren de OSM.

## Despliegue
Subir index.html, styles.css, app.js en la misma carpeta. Requiere navegador moderno y conexión a servicios cartográficos. No incluir secretos en el frontend.
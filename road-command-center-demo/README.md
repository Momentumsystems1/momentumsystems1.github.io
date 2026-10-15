# Momentum Systems · Road Command Center — Demo GitHub Pages

URL: https://momentumsystems1.github.io/road-command-center-demo/

## Alcance
- Versión HTML/CSS/JavaScript estática para presentación, alojada en GitHub Pages.
- Mapa base real OpenFreeMap / OpenStreetMap (requiere conexión a Internet). MapLibre GL JS.
- Cuatro ciudades: Madrid, Barcelona, Valencia y Bilbao.
- Capas de incidentes, V16/FMS, aparcamiento, recarga EV, transporte y cámaras.
- Selección de puntos, 2D/3D, ruta esquemática, centrar mapa, geolocalización consentida y descarga de JSON.

## Advertencias necesarias
- Es una adaptación de demostración, no el despliegue íntegro del ZIP original.
- Los 10 scripts PHP y el backend del ZIP **no se ejecutan** en GitHub Pages.
- Todas las incidencias, vehículos, cámaras, ocupaciones, datos y métricas operativas se generan en el navegador **exclusivamente como escenario ficticio**.
- **No hay conexión real** a DGT, SCT, FMS, balizas V16, proveedores de aparcamiento ni a sistemas de Santander.
- «VISTA EMPRESA» es solo un cambio visual, no autenticación corporativa.
- La ruta es una geometría representativa, **no navegación calculada**.
- La base cartográfica OSM sí se carga desde servicios públicos externos; se pueden producir demoras o limitaciones del proveedor.

## Seguridad
- No incluye el token Mapillary del ZIP ni la clave MapTiler histórica.
- No se han publicado ficheros PHP, credenciales ni endpoints privados.
- OpenFreeMap no requiere clave para esta demo.

## Para conectar datos reales
Desplegar un backend con autenticación, límites de tasa, caché, trazabilidad de fuente/fecha y permisos CORS ajustados al dominio. Añadir configuración segura de proveedores a través de secretos del backend, nunca dentro del JavaScript público.

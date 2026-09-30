# Radar V16 · Momentum Workspace

## Versión de revisión
Panel estático independiente, sin registro ni llamadas a un backend de autenticación. Los informes se generan en el navegador. El historial es temporal, en memoria, y se borra al cerrar o recargar la página.

## Integración en el SaaS
Copiar esta carpeta a `public/tools/radar-v16` en la rama de trabajo del SaaS. Añadir una entrada «Radar V16» a Herramientas/Inteligencia que abra `/tools/radar-v16/index.html#/panel`.

Se puede presentar en iframe:

```html
<iframe src="/tools/radar-v16/index.html#/panel" title="Radar V16" style="width:100%;height:calc(100vh - 100px);border:0"></iframe>
```

En producción, proteger también los archivos estáticos y los datos a nivel de servidor. Ocultar el enlace o proteger únicamente la página contenedora no restringe la descarga del dataset. No incorporar claves, tokens de sesión o documentos privados en esta carpeta. La revisión pública no tiene controles de permisos.

## Datos y límites
- Catálogo: corte indicado por el original a 28/08/2026.
- Análisis documentales: referencias del original a 26/09/2026.
- No existe actualización automática. La fecha de creación de un informe es distinta del corte del dataset.
- Se conserva el archivo recibido, sus relaciones y sus enlaces; no se ha realizado una auditoría externa de todas las afirmaciones.
- El material incorpora observaciones sobre empresas que deben contrastarse antes de su uso comercial o difusión.
- D3 y jsPDF se cargan desde CDN y requieren conexión. Si fallan, las relaciones gráficas y la exportación PDF pueden no estar disponibles.

## Cambios
Acceso directo, diseño sobrio con acento rojo, navegación comprensible, fechas de referencia visibles, página de fuentes y alcance, eliminación del editor incrustado de Perplexity y del registro dependiente de un servidor ausente.

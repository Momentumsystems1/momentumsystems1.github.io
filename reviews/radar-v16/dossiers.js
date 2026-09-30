// Expedientes: narrativa verificada con fuentes. Las cifras de certificados se calculan en vivo desde el listado DGT.
window.DOSSIERS = [
{
  id: "escudero",
  titulo: "Distribuciones Escudero Fijo",
  sub: "Anomalía: un distribuidor valenciano declarado fabricante, con planta china sin nombre",
  filtro: { sol: ["Distribuciones Escudero Fijo, S. L."] },
  foco: "g025",
  claves: [
    ["Razón social", "Distribuciones Escudero Fijo, S.L., CIF B96153564"],
    ["Sede", "Ctra. Aldaia–Xirivella 45, 46960 Aldaia (Valencia)"],
    ["Rol en los certificados", "Fabricante y solicitante a la vez"],
    ["Planta declarada en China", "Kengzi, Pingshan (Shenzhen), sin razón social; dos direcciones distintas"],
    ["Laboratorio", "LCOE (FFII)"],
    ["Marcas", "SOS ROAD, NK, STRONG, BLAM, Drive Alert Connected, DIPART, Carpetauto, Altaudia, PHILIPS"],
    ["Estado", "OBSERVACIÓN DOCUMENTAL PENDIENTE DE CONTRASTE"]
  ],
  html: `<div class="alert"><b>Anomalía documental.</b> Un distribuidor figura como fabricante en <b data-live="certs"></b> certificados LCOE vigentes, con una planta en Shenzhen sin razón social. Lo que sigue son hechos documentados; la calificación jurídica corresponde a la autoridad competente.</div>
<h4>Qué dicen los certificados</h4>
<ul>
<li>En los seis certificados, "Fabricante" y "Solicitante" son la misma sociedad: Distribuciones Escudero Fijo, S.L., Ctra. Aldaia–Xirivella 45, Valencia (LCOE <a href="https://www.dgt.es/.galleries/downloads/muevete-con-seguridad/tecnologia-e-innovacion/certificados-v16/Certificado-2023010078G1.pdf" target="_blank" rel="noopener">2023010078G1</a>, <a href="https://www.dgt.es/.galleries/downloads/muevete-con-seguridad/tecnologia-e-innovacion/certificados-v16/LCOE-2024070677G1_Ext-5_2026050462G1.pdf" target="_blank" rel="noopener">2024070677G1 ext. 5</a>, <a href="https://www.dgt.es/.galleries/downloads/muevete-con-seguridad/tecnologia-e-innovacion/certificados-v16/LCOE-2024070678G1_Ext-3_2026050464G1.pdf" target="_blank" rel="noopener">2024070678G1</a>, <a href="https://www.dgt.es/.galleries/downloads/muevete-con-seguridad/tecnologia-e-innovacion/certificados-v16/LCOE-2024100842G1_Ext-3_2026050463G1.pdf" target="_blank" rel="noopener">2024100842G1</a>, <a href="https://www.dgt.es/.galleries/downloads/muevete-con-seguridad/tecnologia-e-innovacion/certificados-v16/LCOE-2024100843G1_Ext-4_2026050465G1.pdf" target="_blank" rel="noopener">2024100843G1</a>, <a href="https://www.dgt.es/.galleries/downloads/muevete-con-seguridad/tecnologia-e-innovacion/certificados-v16/LCOE-205070657G1_Ext-2_2026050466G1.pdf" target="_blank" rel="noopener">2025070657G1</a>).</li>
<li>Como "emplazamientos" figuran el almacén de Valencia y una dirección en Kengzi, Pingshan (Shenzhen). Ningún certificado nombra a la empresa que fabrica.</li>
<li>La copia de 2024070677G1 que publica Norauto sitúa la planta en "Floor 2, Number 55, Baozi North Road" (<a href="https://s1.medias-norauto.es/ddc/8435183933258_ec_declaration.pdf" target="_blank" rel="noopener">Norauto</a>); la versión vigente en la DGT la sitúa en "301, Building 1, Yazhisen Complex Building, No. 10, Jinsha Industrial 1st Road". Mismo número de certificado, dos plantas distintas, y ninguna de las extensiones listadas describe un cambio de emplazamiento.</li>
<li>La dirección de Baozi North Road 55 corresponde en la web de un fabricante de porteros a la sede de Shenzhen Ruishang Trading Co., Ltd., una sociedad comercial (<a href="http://www.videyt.com/en/Content/834533.html" target="_blank" rel="noopener">Videyt</a>). La de Jinsha Industry 1st Road 10 coincide con Shenzhen Ci-tech Co., Limited, fabricante de enchufes wifi y cargadores de coche (<a href="https://m.globalsources.com/shenzhen-ci-tech/homepage_6008858654067.htm" target="_blank" rel="noopener">Global Sources</a>). Coincidencia de dirección, sin vínculo contractual acreditado.</li>
<li>El modelo SFL1000M/10 se certifica con marca PHILIPS, con Escudero Fijo como fabricante.</li>
</ul>
<h4>Cómo se describe la propia empresa</h4>
<ul>
<li>Su web la presenta como empresa de "distribución profesional de electrónica y tecnología de consumo" (<a href="https://escuderofijo.com/" target="_blank" rel="noopener">Escudero Fijo</a>).</li>
<li>Su director general la describe en la feria de electrónica de Hong Kong como empresa de compras de electrónica para el retail español, con proveedores en China continental y visitas a fábricas de Shenzhen (<a href="https://www.hktdc.com/event/hkelectronicsfairae/tc/success-stories" target="_blank" rel="noopener">HKTDC</a>).</li>
<li>El manual de la SOS ROAD limita la garantía a "productos oficiales importados por Distribuciones Escudero Fijo" (<a href="https://s1.medias-norauto.es/pdf/8435183924850_instruction_es.pdf" target="_blank" rel="noopener">manual en Norauto</a>), y Alcampo la identifica como "Operador / Importador" (<a href="https://www.compraonline.alcampo.es/products/baliza-de-emergencia-v16-sos-road-homologada-y-geolocalizada/567192" target="_blank" rel="noopener">Alcampo</a>).</li>
</ul>
<h4>Marco regulatorio</h4>
<ul>
<li>Anexo XI del Reglamento General de Vehículos (RD 159/2021): exige ensayos fotométricos, IP54, viento, frecuencia y temperatura en laboratorio acreditado por ENAC, y que el certificado indique los marcados. No regula quién es el fabricante ni dónde se fabrica (<a href="https://www.boe.es/buscar/act.php?id=BOE-A-2021-4105" target="_blank" rel="noopener">BOE</a>).</li>
<li>Reglamento (UE) 2023/988, art. 3.8 y 13: es fabricante quien manda fabricar un producto y lo comercializa con su nombre o marca. La etiqueta de fabricante es legalmente admisible para una marca propia, y con ella asume todas las obligaciones del art. 9: documentación técnica, control de la producción en serie y trazabilidad (<a href="https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32023R0988" target="_blank" rel="noopener">EUR-Lex</a>).</li>
<li>Puntos de fricción: declarar como emplazamiento de fabricación un almacén de distribución; la sustitución de la planta china bajo un mismo número de certificado; y la marca PHILIPS, cuyo titular no figura en el expediente.</li>
</ul>
<h4>Por qué el laboratorio lo validó</h4>
<p>El certificado lo firma LCOE (Fundación para el Fomento de la Innovación Industrial, Getafe). En el listado DGT solo hay dos laboratorios, LCOE e IDIADA. Su alcance es ensayar la muestra y certificar sus marcados; los datos de fabricante y emplazamiento los aporta el solicitante. No hay auditoría de fábrica ni control de conformidad de la producción, y eso es lo que permite esta configuración.</p>
<h4>Vías de verificación</h4>
<ul><li>Solicitar a LCOE el expediente de emplazamientos y la extensión que recoge el cambio de planta.</li><li>Petición a la autoridad de vigilancia del mercado de la documentación técnica del art. 9.</li><li>Consultar al titular de la marca PHILIPS la licencia para balizas V16.</li></ul>`
},
{
  id: "kepar",
  titulo: "Kepar Electrónica",
  sub: "El fabricante español que produce para Help Flash, FlashLED, Hella, CUPRA, SEAT y RACC",
  filtro: { fab: ["Kepar Electrónica S.L."] },
  foco: "g047",
  claves: [
    ["Razón social", "Kepar Electrónica S.L. (antes S.A.), NIF B50653047"],
    ["Sede y planta", "C/ Almendro 59, Pol. Malpica-Alfindén, La Puebla de Alfindén (Zaragoza)"],
    ["Propiedad", "Administrador único: Kepar Digital Group SL (NIF B02941789) desde 10/12/2021; socio y administrador único de la holding: José Julián Alonso"],
    ["Producción declarada", "18.000 balizas al día, cuatro turnos, +40 empleados (dic. 2025)"],
    ["Acumulado Help Flash", "Más de 1 millón de balizas fabricadas para Help Flash"],
    ["Facturación", "19 M€ en 2023; objetivo de 50 M€ en 2025"],
    ["Ayudas públicas", "2.304.400 € en garantías y préstamos (ICO, CERSA y otros)"]
  ],
  html: `
<p>Kepar es el fabricante español con más certificados V16 del listado DGT: <b data-live="certs"></b> certificados, <b data-live="modelos"></b> modelos y <b data-live="marcas"></b> marcas distintas para tres solicitantes (Netun Solutions, Turisport y Hella). Todos sus certificados son del laboratorio LCOE y todos siguen vigentes.</p>
<h4>Qué fabrica y para quién</h4>
<ul>
<li><b>Netun Solutions (Help Flash)</b>: Help Flash IoT (primer certificado V16 conectado, LCOE 2022110790G1, 22/12/2022), Help Flash IoT 9V, IoT V4 (HELP FLASH IoT+, NETUN V16, Ángel Gaitán) y Connected (BALIZAUTO IoT, VZero). Kepar se atribuye el diseño óptico, mecánico y electrónico, la reingeniería GNSS + NB-IoT y la industrialización (<a href="https://kepar.es/portfolio/baliza-v16-iot-help-flash/" target="_blank" rel="noopener">Kepar, ficha del proyecto</a>). La Wikipedia recoge que Help Flash lo fabrica Kepar para Netun (<a href="https://es.wikipedia.org/wiki/Help_Flash" target="_blank" rel="noopener">Wikipedia</a>).</li>
<li><b>Turisport (FlashLED)</b>: FlashLED SOS, SOS V16 y SOS v2, con marcas FLASHLED, RACC Mobility Club, CUPRA, SEAT y GEOBALIZA.</li>
<li><b>Hella S.A.</b>: HV16.1 (LCOE 2023070693G1) y HV16.2 (LCOE 2025100968G1). La ficha de Comparativa Balizas sitúa la fabricación del HV16.1 en La Puebla de Alfindén por Kepar y el operador en Vodafone (<a href="https://comparativabalizas.com/producto/hella-hv161" target="_blank" rel="noopener">Comparativa Balizas</a>).</li>
</ul>
<h4>Capacidad y cifras públicas</h4>
<ul>
<li>Cuatro reportó 18.000 unidades al día (una cada 4 segundos), cuatro turnos y 40 empleados más (<a href="https://www.cuatro.com/noticias/economia/20251210/balizas-v16-asi-es-fabrica-hace-una-cada-cuatro-segundos_18_017822388.html" target="_blank" rel="noopener">Cuatro</a>).</li>
<li>Plan de inversión de 6 M€ hasta 2026, 90 empleados, previsión de 10 millones de balizas en dos años, 19 M€ facturados en 2023 y objetivo de 50 M€ en 2025 (<a href="https://www.eleconomista.es/tecnologia/noticias/13119609/12/24/kepar-electronica-invierte-6-millones-en-ampliar-su-capacidad-productiva-en-zaragoza.html" target="_blank" rel="noopener">elEconomista</a>).</li>
<li>La holding Kepar Digital Group aspiraba a 60 M€ en 2026, con oficina de compras y calidad en Shenzhen (<a href="https://www.heraldo.es/branded/la-empresa-aragonesa-con-mas-futuro-en-la-industria-electronica/" target="_blank" rel="noopener">Heraldo, contenido patrocinado</a>).</li>
<li>Empresia muestra 61 empleados y últimas cuentas depositadas de 2024, con capital de 1.560.117,87 € (<a href="https://www.empresia.es/empresa/kepar-electronica/" target="_blank" rel="noopener">Empresia</a>).</li>
</ul>
<h4>Estructura societaria</h4>
<p>Desde el 10/12/2021 el administrador único es Kepar Digital Group SL, que sustituyó a José Julián Alonso (<a href="https://www.boe.es/borme/dias/2021/12/17/pdfs/BORME-A-2021-240-50.pdf" target="_blank" rel="noopener">BORME 17/12/2021</a>). La holding (NIF B02941789, constituida el 16/12/2020, capital 200.000 €) tiene como socio y administrador único a José Julián Alonso (<a href="https://infonif.economia3.com/ficha-empresa/kepar-digital-group-sl" target="_blank" rel="noopener">Infonif</a>).</p>
<h4>Puntos de atención</h4>
<ul>
<li>OKDiario contabiliza 2.304.400 € en ayudas, sobre todo garantías ICO y CERSA (<a href="https://okdiario.com/espana/fabricante-primera-baliza-avalada-dgt-logro-23-millones-ayudas-del-gobierno-16080358" target="_blank" rel="noopener">OKDiario</a>).</li>
<li>Su principal cliente, Netun, arrastra noticias de tensión financiera (pérdidas y preconcurso). Esa dependencia es un riesgo de concentración (ver ficha de Netun).</li>
<li>La misma planta abastece a marcas rivales en el lineal (Help Flash, FlashLED, Hella), así que en la práctica compiten entre sí con electrónica del mismo fabricante.</li>
</ul>`
},
{
  id: "trophy",
  titulo: "Trophy / Idesa Auto Parts",
  sub: "Siete certificados LCOE, todos fabricados por Zhejiang Langke Lighting en Huzhou (China)",
  filtro: { sol: ["IDESA AUTO PARTS S.L.U."] },
  extra: { fab: ["Zhejiang Langke Lighting Co., Ltd"] },
  foco: "g094",
  claves: [
    ["Solicitante", "Idesa Auto Parts S.L.U., NIF B72471451, constituida el 06/09/2022"],
    ["Administración", "Yanyan Zhou, administradora y socia única desde 20/09/2022"],
    ["Domicilio registral", "Ctra. del Prat 4, Sant Boi de Llobregat; la web indica Av. Torrelles 27, Sant Vicenç dels Horts"],
    ["Fabricante real", "Zhejiang Langke Lighting Co., Ltd (Huzhou, Zhejiang)"],
    ["Operador", "Movistar / Telefónica Tech (NB-IoT)"],
    ["Precio visto", "29,92 € en Leroy Merlin (vendedor TiendaEle); 37,50 € en Guanxe"]
  ],
  html: `
<p>Trophy no es un fabricante: es una familia de marcas de Idesa Auto Parts S.L.U. Idesa ha registrado <b data-live="certs"></b> certificados y <b data-live="marcas"></b> marcas. Todos llevan como fabricante a Zhejiang Langke Lighting Co., Ltd.</p>
<h4>Las marcas que salen del mismo dispositivo</h4>
<ul>
<li><b>TROPHY-V16</b> (LCOE 2025020066G1): MOTOR CLUB TROPHY, TROPHY y PITON. El mismo modelo se ha certificado después con otras marcas en certificados distintos: Continental (LCOE 2025080736G1), MG (LCOE 2025080735G1), gorfactory (LCOE 2025090768G1) y SECURVIAL V16 (LCOE 2025090840G1).</li>
<li><b>IWL192 IOT</b> (LCOE 2025060577G1): diez marcas propias o de terceros (idesa auto parts, ide tronic, ide warning light, ide-warning, ide-safelight, ide-safety, MOTOR CLUB TROPHY, PITON, XS, RIDE+GO).</li>
<li><b>TROPHY-V16 PRO</b> (LCOE 2025100966G1): MOTOR CLUB TROPHY, TROPHY, PITON, MG y GEELY.</li>
</ul>
<p>El uso de las marcas Continental, MG y Geely en certificados solicitados por Idesa apunta a acuerdos de licencia o marca blanca para distribución. No hemos encontrado un comunicado público de esas marcas que lo confirme.</p>
<h4>Venta online</h4>
<ul>
<li>Leroy Merlin la vende solo online a 29,92 € a través del marketplace (vendedor TiendaEle, Albacete) y con tres ofertas más desde 37,99 € (<a href="https://www.leroymerlin.es/productos/baliza-trophy-v16-conectada-y-certificada-dgt-98601769.html" target="_blank" rel="noopener">Leroy Merlin</a>).</li>
<li>Guanxe la vende a 37,50 € con el EAN 8432516116302. Su ficha cita el certificado IDIADA PC25020310, que en el listado DGT corresponde a un modelo Chakesi/Limburg (Beacon Light IoT CH-010L, marcas CHALLUX y FLASHMATE) y no a Trophy (<a href="https://guanxe.com/es/electronica-para-el-coche/1123043-trophy-baliza-v16-iot-conectada-y-homologada-para-2026-8432516116302.html" target="_blank" rel="noopener">Guanxe</a>). Geobaliza repite el mismo número junto al LCOE correcto y atribuye la conectividad a Telefónica Tech (<a href="https://geobaliza.com/products/baliza-v16-trophy-conectada-certificada-dgt" target="_blank" rel="noopener">Geobaliza</a>).</li>
<li>Comparativa Balizas la presenta como orientada al canal profesional y de talleres, sin canal B2C y con Movistar como operador (<a href="https://comparativabalizas.com/producto/motor-club-trophy-trophy-y-piton-trophy-v16" target="_blank" rel="noopener">Comparativa Balizas</a>).</li>
</ul>
<h4>Estado de la empresa</h4>
<p>Idesa Auto Parts S.L.U. se constituyó en 2022 y está administrada por Yanyan Zhou. Declara ventas de entre 3 y 6 M€ y entre 11 y 25 empleados (<a href="https://www.iberinform.es/empresa/10086497/idesa-auto-parts" target="_blank" rel="noopener">Iberinform</a>; <a href="https://www.datoscif.es/empresa/idesa-auto-parts-sl" target="_blank" rel="noopener">DatosCIF</a>). Su web presume de "50 años" como fabricante de alfombrillas (<a href="https://idesaautoparts.com/" target="_blank" rel="noopener">Idesa Auto Parts</a>), algo que no encaja con una sociedad creada en 2022. Puede ser una marca histórica heredada por la nueva sociedad, pero no lo hemos podido verificar.</p>
<h4>Zhejiang Langke: los otros clientes</h4>
<p>Langke fabrica también MOD-V16 y MOD-V16PRO para Moby Tec Commerce (ExtraStar, ExtraHouse y Mikomika) y KDE-V16 para General Light (KDE, ilumini, urban SOCIETY, SOS ON TIME, RAYPOW y Magic Select). En total suma <b data-live-fab="Zhejiang Langke Lighting Co., Ltd"></b> certificados en el listado.</p>`
},
{
  id: "osram",
  titulo: "OSRAM LEDguardian",
  sub: "La baliza de OSRAM la fabrica Hangzhou Tiger, que vende su propio modelo por Alibaba y certifica otro a través de una sociedad británica",
  filtro: { sol: ["OSRAM GmbH"] },
  extra: { fab: ["Hangzhou Tiger Auto Industry Co., Ltd"] },
  foco: "g073",
  claves: [
    ["Solicitante", "OSRAM GmbH (grupo ams OSRAM), Alemania"],
    ["Fabricante real", "Hangzhou Tiger Auto Industry Co., Ltd (Lin'an, Hangzhou, China)"],
    ["Modelo", "LEDguardian ROAD FLARE Signal V16 IoT, ref. LEDSL105 / LEDSL105-1"],
    ["Marcas en el certificado", "OSRAM, BMW, AUDI, PORSCHE, SKODA, VW, TOYOTA y LEXUS (IDIADA PC25050113)"],
    ["Precio visto", "Desde 17,59 € en Idealo; 23,90 € en Oscaro"],
    ["Impacto en el grupo", "Ingresos L&S EMEA de 361 M€ en 2025, frente a 347 M€ en 2024; ams OSRAM cita las luces de advertencia entre las causas"]
  ],
  html: `
<p>OSRAM tiene <b data-live="certs"></b> certificados IDIADA. El primero, PC24050316, es de mayo de 2024. El segundo, PC25050113, extiende el modelo LEDSL105-1 a siete marcas de coche: BMW, AUDI, PORSCHE, SKODA, VW, TOYOTA y LEXUS. Es el caso más claro de baliza de marca de fabricante de automóvil en el listado.</p>
<h4>Quién la fabrica</h4>
<ul>
<li>El certificado DGT declara como fabricante a Hangzhou Tiger Auto Industry Co., Ltd. Comparativa Balizas sitúa la fabricación en Hangzhou y el operador en Movistar (<a href="https://comparativabalizas.com/producto/osram-osram-ledguardian-road-flare-signal-v16-iot" target="_blank" rel="noopener">Comparativa Balizas</a>).</li>
<li>La ficha oficial describe la referencia LEDSL105, con SIM integrada, IP54, pila de 9 V y 12 años de garantía (<a href="https://www.osram.com/ecat/LEDguardian%20ROAD%20FLARE%20Signal%20V16%20IoT-Warning%20and%20safety%20lights-Automotive/com/en/GPS01_32046071/" target="_blank" rel="noopener">OSRAM eCat</a>). ams OSRAM la presentó el 25/03/2025 (<a href="https://ams-osram.com/news/press-releases/v16-iot-road-flare-signal" target="_blank" rel="noopener">ams OSRAM, nota de prensa</a>).</li>
</ul>
<h4>El mismo fabricante, por otros canales</h4>
<ul>
<li>(Hangzhou) Tiger Auto Accessories vende balizas "V16 IoT connected to the DGT 3.0" en Alibaba a 11,65–11,75 USD, con pedido mínimo de 5.000 unidades y 65.500 vendidas en una de las fichas (<a href="https://cntigerauto.en.alibaba.com/" target="_blank" rel="noopener">Alibaba, Tiger Auto</a>; <a href="https://www.accio.com/plp/hella-beacons" target="_blank" rel="noopener">Accio</a>).</li>
<li>Tiger certifica además sus propios modelos TWL043 (Tiger Auto, WarnLight GEO PRO) y TWL046 (Tiger Auto) a través de <b>Finder V16 Solution Limited</b>, una sociedad británica creada el 06/04/2024 cuyo director es Xuan Zhang. Sus certificados citan el 291 Brighton Road de Croydon, la misma dirección que Limburg (ver expediente Limburg).</li>
</ul>
<h4>Contexto corporativo</h4>
<p>En su informe anual de 2025, ams OSRAM atribuye parte del crecimiento de Lamps &amp; Systems en EMEA (de 347 a 361 M€) a las luces de advertencia, en el contexto de la obligación española (<a href="https://ams-osram.com/documents/d/ams-osram/eng-geschafts-und-nachhaltigkeitsbericht-ams-osram-2025" target="_blank" rel="noopener">ams OSRAM, informe anual 2025</a>). El grupo está vendiendo negocios no estratégicos, como Entertainment &amp; Industry Lamps por 114 M€ (<a href="https://ams-osram.com/news/press-releases/sale-of-eni-2025" target="_blank" rel="noopener">ams OSRAM</a>). Conviene seguir si la división de lámparas de automoción cambia de dueño.</p>`
},
{
  id: "hella",
  titulo: "Hella (Forvia)",
  sub: "Dos generaciones hechas en Zaragoza por Kepar y dos nuevas hechas en China por Foshan Sanmak",
  filtro: { sol: ["HELLA S.A."] },
  foco: "g050",
  claves: [
    ["Solicitante", "Hella S.A., NIF A28149813, Tres Cantos (Madrid); constituida el 14/02/1963"],
    ["Plantilla en España", "60–65 empleados, 4 delegaciones incluida Portugal"],
    ["Fabricantes", "Kepar Electrónica (HV16.1 y HV16.2) y Foshan Sanmak Lighting (SONNE V-16 y HELLA V-16 SMART)"],
    ["Operador", "Vodafone, con plan de datos hasta diciembre de 2037"],
    ["Precio visto", "52,39 € en Miravia (+400 vendidas); 54,95 € en Lerm Automoción; 52,40 € en Compradiccion"],
    ["Consejo", "Presidente Ulf Steinberg; consejero delegado mancomunado Stefan Van Dalen"]
  ],
  html: `
<p>Hella S.A. tiene <b data-live="certs"></b> certificados y dos proveedores muy distintos. Las dos primeras generaciones, HV16.1 (LCOE, julio de 2023) y HV16.2 (LCOE, diciembre de 2025), las fabrica Kepar en La Puebla de Alfindén. Las dos más recientes, SONNE V-16 (IDIADA PC25100315) y HELLA V-16 SMART (IDIADA PC25100316), ambas del 29/01/2026, las fabrica Foshan Sanmak Lighting Co., Ltd en Nanhai (Foshan).</p>
<h4>Lo que eso significa</h4>
<ul>
<li>Hella mantiene el mensaje de "concebida y fabricada en España" en distribuidores (<a href="https://www.leonleds.com/pt/content/baliza-v16-hella-" target="_blank" rel="noopener">LeonLeds</a>; <a href="https://www.compradiccion.com/automovil-y-gps/balizas-v16-homologadas-dgt-fabricadas-espana-5-modelos-made-in-spain-validos-1-enero" target="_blank" rel="noopener">Compradiccion</a>). Ese mensaje solo es válido para las referencias HV16.x. La SMART y la SONNE son de fabricación china.</li>
<li>Foshan Sanmak también figura, junto con Zhongshan Jucar, como fabricante de la ZTE E1 (ZTE España). Es decir, parte del catálogo de Hella sale del mismo proveedor que el de ZTE.</li>
<li>SONNE es una segunda marca que Hella certifica a su nombre. Es probable que se destine a un precio más bajo o a otro canal.</li>
</ul>
<h4>Producto y venta</h4>
<ul>
<li>La ficha oficial indica red IoT de Vodafone, localización cada 100 segundos, IP54 y datos hasta diciembre de 2037 (<a href="https://www.hella.com/partnerworld/es/Gama-de-productos/Iluminacion/Baliza-Conectada-HELLA-V-16-10475/" target="_blank" rel="noopener">Hella Partnerworld</a>).</li>
<li>En Miravia se vende a 52,39 € con más de 400 unidades vendidas (<a href="https://www.miravia.es/kw/baliza-v16-conectada-hella.html" target="_blank" rel="noopener">Miravia</a>). Comparativa Balizas señala que no tiene canal B2C propio: se vende a través de distribuidores y talleres (<a href="https://comparativabalizas.com/producto/hella-hv161" target="_blank" rel="noopener">Comparativa Balizas</a>).</li>
</ul>
<h4>Empresa</h4>
<p>Forvia Hella en España tiene su sede en Tres Cantos, entre 60 y 65 empleados y 63 años de presencia en el país (<a href="https://www.hella.com/en/spain-es.html" target="_blank" rel="noopener">Hella España</a>). Las ventas figuran en el rango de 10 a 50 M€ y las últimas cuentas son de 2023 (<a href="https://www.infoempresa.com/en-in/es/company/hella-sa" target="_blank" rel="noopener">Infoempresa</a>).</p>`
},
{
  id: "limburg",
  titulo: "Limburg Technology",
  sub: "106 certificados desde una sociedad británica durmiente: el mayor nodo del mercado",
  filtro: { sol: ["LIMBURG TECHNOLOGY CO., LIMITED"] },
  foco: "g014",
  claves: [
    ["Registro", "Limburg Technology Limited, Companies House 14259827"],
    ["Estado", "Activa; cuentas de sociedad durmiente (SIC 99999) a 31/07/2025"],
    ["Avisos de disolución", "GAZ1 el 25/02/2025 y el 02/09/2025, luego retirados"],
    ["Cambio de control", "12/08/2026: sale Feng Zheng y entra Qi Chen (Ningbo) con más del 75 %"],
    ["Domicilios", "Croydon, Cardiff (por defecto de CH), Kenilworth, Manchester, Beckenham y Silsden (2026)"],
    ["Fabricantes", "Ningbo Chakesi (88) y Ningbo Tianqi (18)"]
  ],
  html: `
<p>Limburg es el solicitante con más certificados: <b data-live="certs"></b>, que se reparten en <b data-live="modelos"></b> modelos y <b data-live="marcas"></b> marcas. El modelo CH-019 aparece bajo 48 marcas distintas. Su web comercial es la de la marca Challux (<a href="http://www.limburg-tech.com/" target="_blank" rel="noopener">limburg-tech.com</a>; <a href="https://www.challux.com/" target="_blank" rel="noopener">Challux</a>).</p>
<h4>Registro británico (verificado en Companies House)</h4>
<ul>
<li>La sociedad está activa, pero presenta cuentas de sociedad durmiente, es decir, sin actividad declarada. Recibió dos avisos de disolución (GAZ1) en 2025 que después se retiraron, y su domicilio ha pasado por seis direcciones (<a href="https://find-and-update.company-information.service.gov.uk/company/14259827" target="_blank" rel="noopener">Companies House</a>).</li>
<li>104 de sus 106 certificados citan el 291 Brighton Road de Croydon. En esa misma dirección estaban los secretarios corporativos que usa también Finder V16 Solution (el canal de Hangzhou Tiger).</li>
<li>El 12/08/2026 Feng Zheng dejó de ser director y titular del control, y Qi Chen, con domicilio en Ningbo, entró con más del 75 %.</li>
</ul>
<h4>Prensa</h4>
<p>The Objective ha publicado una serie sobre esta red: homologaciones concentradas en empresas pantalla (<a href="https://theobjective.com/espana/2026-01-14/dgt-homologacion-balizas-v16-red-china-blanqueo/" target="_blank" rel="noopener">The Objective, 14/01/2026</a>), el aviso británico de liquidación (<a href="https://theobjective.com/espana/2026-01-19/reino-unido-insta-liquidar-empresa-mercado-balizas/" target="_blank" rel="noopener">The Objective, 19/01/2026</a>) y la respuesta del Gobierno (<a href="https://theobjective.com/espana/politica/2026-02-02/gobierno-dgt-balizas-red-china/" target="_blank" rel="noopener">The Objective, 02/02/2026</a>). Bandaancha ya contaba 78 homologaciones de Limburg en noviembre de 2025 (<a href="https://bandaancha.eu/articulos/27-empresas-concentran-fabricacion-230-11560" target="_blank" rel="noopener">Bandaancha</a>).</p>`
},
{
  id: "ledel",
  titulo: "Ledel Solutions",
  sub: "38 certificados del modelo V16IoT de Yuyao Jiming a nombre de una sociedad británica durmiente",
  filtro: { sol: ["LEDEL SOLUTIONS CO., LTD"] },
  foco: "g106",
  claves: [
    ["Registro", "Ledel Solutions Co., Ltd, Companies House 14734987 (16/03/2023)"],
    ["Domicilio", "41 Devonshire Street, Londres"],
    ["Directora y titular", "Xiulan Wang (nacionalidad china, 11/1982)"],
    ["Cuentas", "De sociedad durmiente en 2024, 2025 y a 31/03/2026"],
    ["Retirados", "Don Feliz (PC24020028), The Boutique For Your Car (PC25020290) e Ikrea (PC25060006)"]
  ],
  html: `
<p>Ledel es el segundo solicitante por número de certificados (<b data-live="certs"></b>) y todos los ha fabricado Yuyao Jiming. Tres de ellos ya no están vigentes. Pese al volumen de certificados, la sociedad declara cuentas de sociedad durmiente, sin actividad (<a href="https://find-and-update.company-information.service.gov.uk/company/14734987" target="_blank" rel="noopener">Companies House</a>). El País Motor recogió las retiradas de certificados (<a href="https://motor.elpais.com/actualidad/la-dgt-anula-la-homologacion-de-cinco-balizas-v-16-comprueba-si-la-tuya-esta-afectada-y-si-necesitas-comprar-otra/" target="_blank" rel="noopener">El País Motor</a>).</p>`
}
];

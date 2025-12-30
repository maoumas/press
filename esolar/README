# ☀️ Sistema de Energía Solar Híbrido 5kW (48V)

Este documento detalla la lista de materiales (BOM) optimizada para un sistema solar de 5000W. La configuración prioriza componentes de **Litio (LiFePO4)** de Amazon para el almacenamiento y electrónica, manteniendo los paneles solares con proveedores locales para maximizar el ahorro.

## 📊 Resumen del Proyecto
* **Potencia Inversor:** 5000W (48V DC -> 110/120V AC)
* **Capacidad Batería:** ~10.2 kWh (Litio LiFePO4 - 100% Usable)
* **Potencia Solar:** 4800W (12 Paneles de 400W)
* **Tecnología:** Híbrida (Funciona con/sin red eléctrica)

---

## 🛒 Lista de Materiales (BOM)

| Componente | Referencia / Modelo Recomendado | Cant. | Precio Unit. (Est.) | Subtotal | Notas / Link |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Inversor Híbrido** | `PowMr 5000W 48V (POW-HVM5.0M-48V)` | 1 | $560 | **$560** | Soporta funcionamiento sin batería. MPPT 80A. |
| **Baterías (Litio)** | `Power Queen 12V 200Ah Plus (200A BMS)` | 4 | $399 | **$1,596** | **¡Importante!** Versión "Plus" con BMS de 200A para soportar picos del inversor. |
| **Paneles Solares** | `Panel Monocristalino 400W` | 12 | $160 | **$1,920** | *Compra Local.* Precio de Amazon es mucho mayor ($300+). |
| **Ecualizador** | `Victron Energy Battery Balancer` | 1 | $65 | **$65** | Vital para balancear 4 baterías de 12V en serie (48V). |
| **Combiner Box** | `ECO-WORTHY 4 String PV Combiner Box` | 1 | $70 | **$70** | Protección de entrada solar (Fusibles + Pararrayos). |
| **Transfer Switch (ATS)** | `GEYA W2R-2P 63A Automatic Transfer Switch` | 1 | $46 | **$46** | Conmutación automática Red/Solar. |
| **Caja Distribución** | `Waterproof Distribution Box (9-12 Way)` | 1 | $30 | **$30** | Riel DIN para alojar el ATS y breakers. |
| **Cables Batería** | `2 AWG Battery Inverter Cables` | 1 | $40 | **$40** | Cobre puro. Mínimo calibre 2 AWG para seguridad. |
| **Aislante Térmico** | `Lynn Mfg Ceramic Fiber Board` | 2 | $40 | **$80** | Protección ignífuga para montaje en pared. |
| **Herramientas** | `Carretilla Plegable Aluminio` | 1 | $60 | **$60** | Logística y movimiento de baterías. |

### 💰 Resumen Financiero

| Concepto | Inversión Estimada |
| :--- | :--- |
| **Equipos Nuevos Amazon (Litio + Inversor)** | ~$2,547 |
| **Paneles Solares (Proveedor Local)** | $1,920 |
| **TOTAL PROYECTO** | **~$4,467** |
| *Ahorro vs. Presupuesto Original* | *~$2,300* |

---

## 🛠️ Notas Técnicas de Instalación

### 1. Configuración del Banco de Baterías
Para lograr **48V** con baterías de 12V, se deben conectar las 4 unidades en **SERIE**:
> `Negativo B1` → `Positivo B2` ... → `Inversor`
* **BMS:** Se seleccionó el modelo de **200A BMS** porque el inversor de 5000W puede exigir picos de >100A, lo que apagaría baterías estándar de litio.
* **Balanceo:** Es obligatorio instalar el **Victron Balancer** conectado a los puntos intermedios de la serie para evitar que las baterías se desequilibren y pierdan vida útil.

### 2. Configuración de Paneles Solares
* **Voltaje:** El inversor soporta hasta **500V DC**.
* **Strings:** Se recomienda configurar los 12 paneles en **2 series de 6 paneles** (o 1 serie de 10-12 si el voltaje total <450V) para optimizar la eficiencia del MPPT.

### 3. Seguridad
* Utilizar **breakers DC** entre paneles e inversor (incluido en la Combiner Box).
* Utilizar un **fusible ANL o T-Class** de 150A-200A entre el banco de baterías y el inversor.

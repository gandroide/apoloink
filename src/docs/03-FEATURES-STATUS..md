### Archivo 3: Componentes y Funcionalidades
**Nombre del archivo:** `docs/03-FEATURES-STATUS.md`

```markdown
# 03. Funcionalidades y Estado del Desarrollo

Este documento detalla qué está construido y cómo funciona cada módulo.

## 1. Autenticación y Onboarding (`/login`, `/signup`, `/onboarding`)
* **Estado:** ✅ Completado.
* **Lógica:**
    * Registro dual: Permite elegir entre "Soy Estudio" o "Soy Independiente".
    * **Trigger SQL:** `handle_new_user` crea el perfil automáticamente.
    * **Onboarding:** Crea el estudio y la suscripción inicial si es necesario.

## 2. Dashboard Principal (`/`)
* **Estado:** ✅ Completado.
* **Lógica:** Muestra KPIs financieros. Se adapta según el rol:
    * *Estudio:* Muestra Ventas Brutas, Netas y "Studio Gross".
    * *Independiente:* Muestra Ingresos Totales y Utilidad Neta (diseño simplificado).

## 3. Contabilidad y Gastos (`/accounting`, `/expenses`)
* **Estado:** ✅ Completado.
* **Lógica:**
    * Registro de trabajos con cálculo de comisiones.
    * Registro de gastos categorizados.
    * **Multi-divisa:** Los valores se muestran usando el hook `useCurrency`.

## 4. Configuración (`/settings`)
* **Estado:** ✅ Completado.
* **Lógica:** Formulario Polimórfico.
    * Si es `Owner`: Edita la tabla `studios` (Nombre comercial, dirección local).
    * Si es `Independent`: Edita la tabla `profiles` (Nombre artístico, teléfono personal).
    * Selector de Moneda Global.

## 5. Super Admin Panel (`/admin`)
* **Estado:** ✅ Completado (Versión 1.0).
* **Lógica:**
    * Dashboard exclusivo para el dueño del SaaS (Tú).
    * Métricas de MRR (Monthly Recurring Revenue).
    * Gestión de Estudios (Ver, Suspender, Eliminar definitivamente).
    * Gestión de Usuarios (Ver ficha, Ascender a Admin, Eliminar usuario).
    * *Seguridad:* Funciones SQL `delete_studio_completely` y `delete_user_completely` para limpieza profunda.

## 6. Inventario
* **Estado:** 🚧 Pendiente / En desarrollo.
* **Necesidad:** Falta crear la tabla `inventory_items` y las vistas para descontar material por trabajo realizado.
Archivo 4: Reglas de Negocio y Lógica Crítica
Nombre del archivo: docs/04-BUSINESS-LOGIC.md

Markdown

# 04. Reglas de Negocio Críticas

Estas son las "leyes" que rigen el código de AXIS.ops. No romper sin una buena razón.

## A. La Regla del "Tenant" (Inquilino)
* Todo dato (gasto, trabajo, cita) debe pertenecer a un `studio_id` (para estudios) O a un `user_id` (para independientes).
* El código debe verificar siempre el rol antes de hacer `INSERT`.

## B. Separación Usuario vs. Estudio
* Un usuario (`profiles`) es una **Persona**.
* Un estudio (`studios`) es un **Lugar/Negocio**.
* Un usuario puede ser dueño de múltiples estudios (escalabilidad futura).
* **Nunca** mezclar datos personales (como la preferencia de moneda) en la tabla del estudio.

## C. Manejo de Moneda
* La moneda es una preferencia de visualización del **Usuario**, no del Estudio.
* Se gestiona mediante el hook `useCurrency`.
* Esto permite que un dueño vea sus finanzas en USD mientras viaja, aunque el estudio opere en COP.

## D. Eliminación de Datos (Cascada)
* No se puede borrar un usuario si tiene dependencias activas (membresías).
* Usar siempre las funciones RPC (`delete_user_completely`) creadas en SQL para garantizar una limpieza segura y evitar errores de *Foreign Key Constraints*.
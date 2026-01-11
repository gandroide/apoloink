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
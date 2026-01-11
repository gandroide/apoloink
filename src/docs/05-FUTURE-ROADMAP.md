# 05. Roadmap y Futuro de AXIS.ops

Planificación para futuras iteraciones con equipos de ingeniería o IA.

## 📅 Corto Plazo (Estabilización)
1.  **Módulo de Inventario:**
    * Crear tabla `inventory_items`.
    * Permitir descontar insumos por "Sesión" (consumibles) o por "Caja/Unidad".
    * Alertas de stock bajo.
2.  **Consentimientos Digitales:**
    * Formularios legales que el cliente firma en iPad/Tablet.
    * Generación de PDF automático y almacenamiento en Supabase Storage.
    * Vinculación automática con la ficha del cliente (`works`).

## 🤖 Medio Plazo (Automatización IA & Chatbot)
*Esta fase es crítica para la operación remota (Portugal ↔ LatAm).*

1.  **AXIS.bot (Robot de Preguntas y Respuestas):**
    * **Objetivo:** Atender clientes 24/7 sin intervención humana inmediata, cubriendo diferencias horarias.
    * **Tecnología:** Integración con LLMs (OpenAI/Gemini) + Base de datos vectorial (RAG) en Supabase.
    * **Funcionalidades Clave:**
        * **Base de Conocimiento Dinámica:** El sistema se alimenta de tus documentos de texto (FAQs, Guías de cuidado, Políticas de precios).
        * **Resolución de Problemas:**
            * *Escenario:* "Mi tatuaje está muy rojo". -> *Respuesta del Bot:* Protocolo médico básico y alerta al artista.
            * *Escenario:* "¿Cómo llego?". -> *Respuesta del Bot:* Envío de ubicación y fotos de la fachada.
        * **Integración Multicanal:** Conexión principal vía **WhatsApp Business API** (lo más usado en LatAm) e Instagram DM.
        * **Filtro Humano:** Si el bot no sabe la respuesta, etiqueta la conversación como "Requiere Humano".

2.  **Agenda Inteligente & Booking:**
    * El bot debe ser capaz de consultar disponibilidad en tiempo real.
    * Solicitud automática de depósito previo (integración con pasarelas de pago locales).

## 🚀 Largo Plazo (Escalabilidad)
1.  **App Nativa:** Migrar a React Native usando el mismo backend de Supabase para notificaciones push en móviles.
2.  **Marketplace B2B:** Permitir a los estudios comprar insumos (tintas, agujas) directamente desde el panel de inventario de AXIS.ops.
3.  **Multisucursal Real:** Panel unificado "Holding" para dueños con múltiples estudios físicos en diferentes países.

## 📝 Notas para Desarrolladores / IA
* **Al retomar el proyecto:** Siempre verificar primero `03-FEATURES-STATUS.md` para ver qué quedó pendiente.
* **Sobre el Chatbot:** No hardcodear las respuestas. Crear una tabla en Supabase llamada `knowledge_base` donde el artista pueda escribir/pegar sus textos de ayuda, y que la IA los lea de ahí. Esto permite actualizar las respuestas sin tocar el código.
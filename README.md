# Formulario Cristina 🚀

Un sistema de encuestas interactivo y animado diseñado para ofrecer una experiencia de usuario premium (estilo Google Forms) con un potente panel de administración.

## ✨ Características Principales

- **Experiencia de Usuario Inmersiva**: Formulario multi-paso con transiciones fluidas y animaciones interactivas utilizando **Framer Motion**.
- **Autenticación Segura**: Integración con **Firebase Auth** para inicio de sesión con Google.
- **Gestión de Datos**: Almacenamiento en tiempo real mediante **Firestore**.
- **Inteligencia del Formulario**:
  - Evaluación de puntajes basada en respuestas correctas.
  - Prevención de múltiples envíos por el mismo usuario.
  - Diferentes tipos de preguntas: Texto, Opción Múltiple y Escala (1-10).
- **Panel de Administración**: Visualización detallada de resultados y gestión de preguntas.
- **Efectos Visuales**: Celebraciones con confeti al completar el formulario con éxito.

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Backend/Base de Datos**: Firebase (Auth & Firestore)
- **Animaciones**: Framer Motion & Canvas Confetti

## 🚀 Comenzando

### Requisitos Previos

- Node.js 18.x o superior
- Una cuenta de Firebase con un proyecto configurado.

### Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno (Opcional):
   Crea un archivo `.env.local` en la raíz y añade tus credenciales de Firebase si es necesario (el proyecto ya cuenta con configuración en `src/lib/firebase.ts`).

4. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 📂 Estructura del Proyecto

- `src/app`: Rutas del sistema (Home, Admin).
- `src/components`: Componentes reutilizables como `Survey.tsx`.
- `src/lib`: Configuración de Firebase y funciones de base de datos (`db.ts`, `firebase.ts`).
- `src/context`: Contextos globales como la autenticación.

---
Desarrollado con ❤️ para una experiencia de usuario excepcional.

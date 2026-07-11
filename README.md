<p align="center">
  <img src="assets/icon.png" alt="Ícono de GymApp" width="120" />
</p>

<h1 align="center">GymApp</h1>

<p align="center">
  Planificá tus rutinas, organizá tus ejercicios y seguí tu progreso de entrenamiento desde una sola app.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2055-000020?logo=expo&logoColor=white" alt="Expo SDK 55" />
  <img src="https://img.shields.io/badge/React%20Native-0.83-61DAFB?logo=react&logoColor=white" alt="React Native 0.83" />
  <img src="https://img.shields.io/badge/Plataformas-Android%20%7C%20iOS%20%7C%20Web-FFD700" alt="Android, iOS y Web" />
</p>

## ¿Qué permite hacer?

- Crear, editar, consultar y eliminar rutinas personalizadas.
- Armar cada rutina con ejercicios, series y repeticiones; el orden se puede cambiar arrastrando.
- Administrar el catálogo de ejercicios y ordenarlo manualmente, de A a Z o de Z a A.
- Registrar peso, repeticiones y si la serie llegó al fallo.
- Consultar el progreso con gráfico, historial y filtro por rango de fechas.
- Usar tema claro u oscuro; la preferencia se conserva entre sesiones.

Todos los datos se guardan localmente en el dispositivo, por lo que la app funciona sin depender de un backend para gestionar rutinas, ejercicios y registros.

## Ejecutar el proyecto

Requiere Node.js `>= 20.19.4`.

```bash
npm ci
npm start
```

Desde Expo podés abrir la aplicación con Expo Go, un emulador o el navegador. También están disponibles los comandos directos:

```bash
npm run android
npm run ios
npm run web
```

## Tecnologías

- Expo y React Native
- React Navigation
- React Native Paper
- AsyncStorage para persistencia local
- React Native Chart Kit para la visualización del progreso

## Organización del proyecto

La aplicación está organizada por funcionalidades para que cada área evolucione de forma independiente:

```text
src/
├── application/      # Arranque, providers y navegación
├── features/         # Rutinas, ejercicios y progreso
├── infrastructure/   # Persistencia local
└── shared/           # Tema, rutas y utilidades comunes
```

La guía técnica de la arquitectura está en [src/README.md](src/README.md).

## Calidad y compatibilidad

El proyecto se valida con Expo SDK 55 y se puede exportar para Android, iOS y web. La configuración de actualizaciones OTA usa EAS Update con canales separados para desarrollo, preview y producción.

---

Hecho para llevar un registro simple, visual y personal del entrenamiento. 💪

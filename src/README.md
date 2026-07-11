# Arquitectura

La aplicación usa una estructura **feature-first**: cada dominio reúne sus
pantallas, componentes, reglas y acceso a datos. La composición global queda
fuera de los features.

```text
src/
├── application/         # Providers, navegación y punto de composición
├── features/
│   ├── exercises/       # Catálogo, orden y formularios de ejercicios
│   ├── routines/        # Listado y edición de rutinas
│   └── progress/        # Registros, filtros, tabla y gráfico
├── infrastructure/
│   └── storage/         # Adaptador de AsyncStorage y claves persistidas
└── shared/              # Tema, rutas y componentes reutilizables
```

## Dirección de dependencias

- `application` compone providers y navegadores, pero no contiene lógica de
  dominio. Se evita el nombre reservado `src/app` de Expo Router.
- Cada feature importa directamente los módulos públicos que necesita. No hay
  barrels globales que mezclen UI y datos.
- `shared` no depende de `application` ni de un feature; el tema usa el adaptador de
  infraestructura para persistir su preferencia.
- `application` depende de `features` y `shared`; los features dependen de
  `shared` e `infrastructure`.
- El acceso a `AsyncStorage` pasa por `storageClient`; las claves viven solo en
  `storageKeys` y mantienen los valores históricos para no migrar datos.
- Las operaciones de lectura-modificación-escritura se serializan por clave en
  `storageMutationQueue` para evitar pérdidas ante acciones concurrentes.
- Los nombres de navegación viven en `shared/navigation/routeNames.js`. Sus
  valores son los originales para conservar rutas y parámetros existentes.
- Las pantallas coordinan estado y navegación; la UI repetida se mantiene en
  componentes del feature correspondiente.

## Persistencia por dominio

- `exerciseRepository`: catálogo, seed inicial, orden custom y modo de orden.
- `routineRepository`: alta, lectura, edición y borrado de rutinas.
- `progressRepository`: registros globales y por ejercicio.
- `themePreferenceRepository`: preferencia de tema.

`getExercises()` conserva intencionalmente su comportamiento previo: además de
leer, puede sembrar ejercicios predeterminados y reconciliar el orden custom.

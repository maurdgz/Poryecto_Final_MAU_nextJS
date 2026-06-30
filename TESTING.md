
# Testing de MVPcode

## 1. Pruebas de Código (Unitarias e Integración)
Las pruebas verifican la funcionalidad básica de la aplicación.

**Comandos:**
```bash
npm test              # Ejecutar todas las pruebas
npm run test:watch    # Modo watch (se actualiza al cambiar código)
npm run test:coverage # Ver cobertura de pruebas
```


## 2. Pruebas de Datos (Seeding)
Genera datos masivos para probar la aplicación con volúmenes realistas.

### Variables Configurables
Puedes ajustar la cantidad de datos con variables de entorno:
- `NUM_CLIENTS`: Número de clientes (default: 250)
- `NUM_DEVELOPERS`: Número de desarrolladores (default: 250)
- `NUM_PROJECTS`: Número de proyectos (default: 100)
- `MAX_APPLICATIONS_PER_PROJECT`: Máximas postulaciones por proyecto (default: 10)

### Comandos Rápidos
```bash
# Datos pequeños (500 usuarios, 100 proyectos)
npm run db:seed

# Datos medianos (10k usuarios, 2k proyectos)
npm run db:seed:10k

# Datos GRANDES (50k usuarios, 10k proyectos)
npm run db:seed:50k
```


## 3. Pruebas de Estrés y Rendimiento
Usamos **k6** para simular tráfico real y medir el rendimiento.

---

### Paso 1: Instalar k6
- **Windows (Chocolatey):** `choco install k6`
- **Descarga directa:** https://dl.k6.io/

---

### Paso 2: Pruebas Básicas (Local o Vercel)
**Prueba de carga normal (500 usuarios):**
```bash
# Local
npm run k6:load

# Vercel
set BASE_URL=https://tu-app.vercel.app&& npm run k6:load
```

**Prueba de estrés (1k usuarios):**
```bash
npm run k6:stress
```

---

### Paso 3: Pruebas EXTREMAS (10k - 50k Usuarios)
⚠️ **Importante:** 
- No puedes correr 10k-50k usuarios en una sola PC!
- Para 10k: Necesitas una máquina potente (16GB RAM+)
- Para 50k: Necesitas **k6 Cloud** (distribuye la carga)

---

#### Prueba de 10,000 Usuarios
```bash
# Local (si tu PC es potente)
npm run k6:extreme-10k

# Vercel
set BASE_URL=https://tu-app.vercel.app&& npm run k6:extreme-10k
```

---

#### Prueba de 50,000 Usuarios (k6 Cloud)
1. Crea una cuenta en **https://k6.io/**
2. Obtén tu **API Token** y **Project ID**
3. Ejecuta:
```bash
# Configura tus credenciales
set K6_CLOUD_TOKEN=tu-token-aqui
set K6_PROJECT_ID=tu-project-id
set BASE_URL=https://tu-app.vercel.app

# Correr la prueba en la nube
npm run k6:extreme-50k-cloud
```

k6 Cloud distribuirá la carga entre múltiples servidores globales (EE.UU., Europa, Asia) para simular tráfico real.

---


## 4. ¿Qué Medir y Esperar?
Cuando ejecutes las pruebas, busca estos resultados:

| Métrica                | Objetivo Ideal          |
|------------------------|-------------------------|
| `http_req_failed`      | **< 1%**                |
| `http_req_duration`    | **p(95) < 2seg**        |
| `vus` (usuarios)       | Mantiene el objetivo    |
| `iterations`           | Constantes              |

---


## 5. Si las Pruebas Fallan: Tips para Mejorar
Si las pruebas de estrés encuentran cuellos de botella:

1. **Paginación:** Agrega paginación en `/api/projects` si tienes miles de proyectos
2. **Caché:** Usa Vercel Edge Functions o Redis para datos que no cambian mucho
3. **Índices BD:** Asegúrate que Prisma esté creando índices en campos buscados (email, projectId, userId)
4. **Optimiza consultas:** Evita N+1 queries usando `include` en Prisma
5. **Monitorea Neon:** Usa la consola de Neon para ver el rendimiento de tu BD PostgreSQL


## 6. Flujo Completo de Pruebas
Para probar tu aplicación de manera exhaustiva:
1. `npm run db:seed:10k` - Genera datos medianos
2. `npm test` - Asegúrate que las pruebas de código pasen
3. `npm run k6:load` - Prueba de carga normal
4. `npm run k6:extreme-10k` - Prueba de 10k usuarios
5. (Opcional) `npm run k6:extreme-50k-cloud` - Prueba máxima con k6 Cloud

# Plataforma de Proyectos - Next.js

Plataforma tipo Twitter para conectar clientes con desarrolladores de proyectos.

## 📋 Requisitos Previos

Antes de empezar, necesitas tener instalado:

1. **Node.js** (versión 20 o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **Git** (opcional, para clonar el repositorio)
   - Descargar desde: https://git-scm.com/

3. **Editor de código** (recomendado: VS Code)
   - Descargar desde: https://code.visualstudio.com/

## 🚀 Guía Paso a Paso para Correr el Proyecto

### Paso 1: Obtener el Código

**Opción A: Si tienes acceso al repositorio Git**
```bash
git clone <URL-del-repositorio>
cd next-code
```

**Opción B: Si te enviaron el código comprimido**
1. Descomprime la carpeta `next-code`
2. Abre esa carpeta en tu editor de código

### Paso 2: Instalar Dependencias

Abre una terminal (CMD, PowerShell o Git Bash) en la carpeta del proyecto y ejecuta:

```bash
npm install
```

**¿Qué hace esto?**
- Descarga todas las librerías necesarias para que el proyecto funcione
- Puede tardar varios minutos la primera vez

### Paso 3: Configurar Variables de Entorno

1. Busca el archivo `.env.example` en la raíz del proyecto
2. Crea una copia y renómbrala a `.env`
3. Abre el archivo `.env` y configura las siguientes variables:

```env
# Database (URL de tu base de datos PostgreSQL)
DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre-base-datos"

# NextAuth (para autenticación)
NEXTAUTH_SECRET="genera-un-texto-aleatorio-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (opcional, para login con Google)
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"
```

**Nota:** Si no tienes base de datos PostgreSQL configurada, contacta al líder del equipo para obtener la URL correcta.

### Paso 4: Configurar la Base de Datos

Si es la primera vez que corres el proyecto:

```bash
npx prisma generate
npx prisma db push
```

**¿Qué hacen estos comandos?**
- `prisma generate`: Genera el cliente de Prisma para conectar con la base de datos
- `prisma db push`: Sincroniza el esquema de la base de datos con Prisma

### Paso 5: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

**¿Qué hace esto?**
- Inicia el servidor de desarrollo de Next.js
- El proyecto estará disponible en: http://localhost:3000

### Paso 6: Abrir el Navegador

1. Abre tu navegador web (Chrome, Firefox, Edge, etc.)
2. Ve a: http://localhost:3000
3. ¡Listo! Deberías ver la aplicación funcionando

## 🛠️ Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm start

# Verificar errores de código
npm run lint

# Reiniciar base de datos (¡cuidado! borra datos)
npm run db:reset
```

## 📁 Estructura del Proyecto

```
next-code/
├── src/
│   ├── app/           # Páginas de la aplicación
│   ├── components/    # Componentes reutilizables
│   └── lib/           # Utilidades y configuraciones
├── prisma/
│   └── schema.prisma  # Esquema de base de datos
├── public/            # Archivos estáticos
└── package.json       # Dependencias del proyecto
```

## 🔧 Solución de Problemas Comunes

### Error: "Module not found"
**Solución:** Ejecuta `npm install` nuevamente

### Error: "Database connection failed"
**Solución:** Verifica que la URL en `DATABASE_URL` sea correcta y que la base de datos esté accesible

### Error: "Port 3000 is already in use"
**Solución:** El puerto 3000 ya está ocupado. Puedes:
- Cerrar el otro programa usando el puerto 3000
- O Next.js usará automáticamente el puerto 3001

### Error: "Prisma Client not generated"
**Solución:** Ejecuta `npx prisma generate`

## 📞 Soporte

Si tienes problemas:
1. Verifica que Node.js esté instalado correctamente
2. Asegúrate de estar en la carpeta correcta del proyecto
3. Revisa que el archivo `.env` esté configurado correctamente
4. Contacta al líder del equipo para ayuda específica

## 🎯 Tecnologías Utilizadas

- **Next.js 16** - Framework de React
- **Prisma** - ORM para base de datos
- **NextAuth** - Autenticación
- **Tailwind CSS** - Estilos
- **TypeScript** - Tipado estático

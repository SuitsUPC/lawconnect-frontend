# LawConnect Frontend

Aplicación web profesional para conectar abogados con clientes y gestionar casos legales.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Modo Desarrollo (Solo Frontend con Mock Data)

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Modo Desarrollo (Frontend + Backend)

1. **Primero, levanta el backend** (ver [lawconnect-backend](../lawconnect-backend)):
   ```bash
   cd lawconnect-backend
   docker compose -f microservices/docker-compose.yml up -d
   ```

2. **Luego, inicia el frontend**:
   ```bash
   npm run dev
   ```

La aplicación se conectará automáticamente al backend en `http://localhost:8080` (API Gateway).

## 📁 Estructura del Proyecto

```
lawconnect-frontend/
├── app/                    # App Router de Next.js
│   ├── auth/              # Páginas de autenticación
│   │   ├── login/         # Inicio de sesión
│   │   └── signup/        # Registro
│   ├── cases/             # Gestión de casos
│   │   ├── [id]/          # Detalle de caso
│   │   └── create/        # Crear nuevo caso
│   ├── lawyer/[id]/       # Perfil de abogado
│   ├── messages/          # Sistema de mensajería
│   ├── search/            # Búsqueda de abogados
│   └── page.tsx           # Dashboard principal
├── components/            # Componentes React
│   ├── ui/                # Componentes UI base
│   ├── navbar.tsx         # Barra de navegación
│   ├── search-*.tsx       # Componentes de búsqueda
│   ├── cases-*.tsx        # Componentes de casos
│   └── messages-*.tsx     # Componentes de mensajería
├── lib/
│   ├── api.ts             # Configuración de endpoints
│   └── utils.ts           # Utilidades
├── hooks/                 # Custom React hooks
├── public/                # Archivos estáticos
└── db.json               # Datos mock (opcional)
```

## 🔌 Integración con Backend

### Arquitectura de Microservicios

El frontend se conecta al backend a través del **API Gateway** (puerto 8080):

```
Frontend (3000) 
    ↓
API Gateway (8080)
    ↓
├── IAM Service (8081)      - Autenticación
├── Profiles Service (8082) - Perfiles de usuarios
└── Cases Service (8083)    - Gestión de casos
```

### Endpoints Configurados

Ver [ENDPOINTS_MAP.md](./ENDPOINTS_MAP.md) para el mapeo completo de endpoints.

### Variables de Entorno

**IMPORTANTE**: La variable de entorno `NEXT_PUBLIC_API_URL` es **obligatoria**. 

Crear `.env.local` en la raíz del proyecto:

```env
# URL del API Gateway (obligatorio)
NEXT_PUBLIC_API_URL=http://localhost:8080
```

También puedes copiar el archivo de ejemplo:
```bash
cp .env.example .env.local
```

Luego edita `.env.local` con la URL correcta de tu backend.

### Configuración Requerida

El frontend **requiere** que la variable de entorno `NEXT_PUBLIC_API_URL` esté configurada. Sin esta variable, la aplicación no iniciará.

Asegúrate de tener tu backend corriendo y configurar la URL correcta en `.env.local`.

## 🎨 Características

- ✅ **Autenticación completa** (Login/Signup)
- ✅ **Dashboard estilo LinkedIn** con actividad reciente
- ✅ **Búsqueda de abogados** con filtros avanzados
- ✅ **Gestión de casos** (crear, listar, detalle)
- ✅ **Perfiles de abogados** detallados
- ✅ **Sistema de mensajería** (solo mock por ahora)
- ✅ **Diseño responsive** (mobile, tablet, desktop)
- ✅ **Paleta corporativa profesional** (Slate-900)

## 🎨 Paleta de Colores

- **Primary**: Slate-900 (#0f172a) - Botones, navbar
- **Hover**: Slate-800 (#1e293b)
- **Secondary**: Slate-700 (#334155)
- **Background**: White / Gray-50
- **Accents**: Blue, Yellow, Green para estados

## 👥 Credenciales de Prueba

### Mock (Sin backend)
Usa cualquier email y contraseña. Ejemplos:
- `carlos.mendoza@lawconnect.com` / `123456`
- `juan.perez@email.com` / `password`

### Con Backend Real
Primero registra un usuario en `/auth/signup` o usa credenciales existentes en la base de datos.

## 🛠️ Scripts Disponibles

```bash
npm run dev       # Desarrollo (solo frontend)
npm run api       # JSON Server mock (puerto 8083)
npm run dev:all   # Frontend + JSON Server
npm run build     # Build para producción
npm run start     # Servidor de producción
npm run lint      # Linter
```

## 📱 Páginas

- `/` - Dashboard principal (requiere login)
- `/auth/login` - Inicio de sesión
- `/auth/signup` - Registro
- `/search` - Buscar abogados
- `/cases` - Mis casos
- `/cases/create` - Crear caso
- `/cases/[id]` - Detalle de caso
- `/lawyer/[id]` - Perfil de abogado
- `/messages` - Mensajería (mock)

## 🔐 Flujo de Autenticación

1. Usuario visita `/` → Redirige a `/auth/login` si no hay sesión
2. Usuario inicia sesión → Guarda JWT en `localStorage`
3. Requests a API incluyen `Authorization: Bearer {token}`
4. Usuario cierra sesión → Limpia `localStorage` y redirige a `/auth/login`

## 🧪 Testing

El frontend incluye datos mock integrados, por lo que puedes probar todas las funcionalidades sin backend:

1. **Búsqueda**: Ve a `/search` y busca abogados
2. **Casos**: Ve a `/cases` y filtra por estado/tipo
3. **Mensajes**: Ve a `/messages` y envía mensajes
4. **Perfiles**: Ve a `/lawyer/1` para ver un perfil

## 🐛 Solución de Problemas

### La aplicación no conecta con el backend

1. Verifica que el backend esté corriendo: `docker compose ps`
2. Verifica la variable de entorno: `NEXT_PUBLIC_API_URL`
3. Revisa la consola del navegador para errores de CORS
4. Verifica que el API Gateway esté en puerto 8080

### Errores de CORS

Si ves un error como:
```
Access to XMLHttpRequest ... has been blocked by CORS policy
```

El backend debe configurar CORS para permitir peticiones desde el frontend. El backend debe permitir:

- **Origin**: `http://localhost:3000` o `http://localhost:3001` (según el puerto donde corra Next.js)
- **Headers**: `Content-Type, Authorization`
- **Methods**: `GET, POST, PUT, DELETE, OPTIONS`

**Configuración típica en Spring Boot:**
```java
@CrossOrigin(origins = "http://localhost:3000,http://localhost:3001")
```

O en la configuración global de CORS del API Gateway.

### No se muestran datos

1. Abre la consola del navegador (F12)
2. Ve a la pestaña Network
3. Verifica si las requests a API fallan
4. Si fallan, el componente usará datos mock automáticamente

## 📄 Tecnologías

- **Next.js 16** - Framework React con App Router
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 4** - Estilos utility-first
- **Lucide React** - Iconos modernos
- **date-fns** - Manejo de fechas
- **json-server** - API mock para desarrollo

## 📞 Repositorio Backend

[lawconnect-backend](../lawconnect-backend)

## 📝 Licencia

Proyecto de ejemplo para fines educativos.

---

Desarrollado con ❤️ por el equipo de LawConnect

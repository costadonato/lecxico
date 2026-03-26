# Configuración del Panel Profesional - Lecxico

## Problema: "Invalid login credentials" después del registro

### Causa
Supabase requiere confirmación de email por defecto. Los usuarios no pueden iniciar sesión hasta confirmar su email.

### Solución: Desactivar confirmación de email

#### Opción 1: Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** → **Providers** → **Email**
3. Busca la opción **"Confirm email"**
4. **Desactívala** (OFF)
5. Guarda los cambios

#### Opción 2: Supabase CLI

```bash
supabase auth update --enable-signup --confirm-email=false
```

#### Opción 3: Variable de entorno

Agrega en tu proyecto de Supabase:

```
SUPABASE_AUTH_EMAIL_ENABLE_CONFIRMATIONS=false
```

---

## Sistema de Roles Profesionales

### Roles Implementados

#### 1. Docente (`professionalType: "docente"`)
- **URL**: `/professional/docente`
- **Herramientas**:
  - Ver progreso por alumno
  - Ver desempeño por juego
  - Ver asistencia y uso
  - Ver alertas automáticas
- **Restricciones**:
  - NO puede ver notas clínicas
  - NO puede configurar dificultad de juegos
  - NO puede generar informes profesionales

#### 2. Psicopedagogo (`professionalType: "psicopedagogo"`)
- **URL**: `/professional/psicopedagogo`
- **Herramientas completas**:
  - Registro de observaciones clínicas privadas
  - Historial longitudinal del alumno
  - Configuración de dificultad de juegos
  - Adaptación personalizada de ejercicios
  - Generación de informes profesionales
- **Acceso total** a evaluación profunda

---

## Base de Datos

### Tablas Principales

#### `users`
```sql
- id (uuid)
- name (text)
- email (text)
- role (text) -- 'teacher' | 'psychopedagogist' | 'parent'
- professional_type (text) -- 'docente' | 'psicopedagogo'
- school_id (uuid)
- created_at (timestamp)
```

#### `students`
```sql
- id (uuid)
- name (text)
- age (integer)
- grade (text)
- mode (text) -- 'child' | 'teen'
- psychopedagogist_id (uuid)
- teacher_ids (uuid[])
- created_at (timestamp)
```

#### `clinical_notes` (solo psicopedagogos)
```sql
- id (uuid)
- student_id (uuid)
- psychopedagogist_id (uuid)
- note (text)
- created_at (timestamp)
```

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS que filtran automáticamente por rol:
- **Docentes**: Solo ven estudiantes asignados
- **Psicopedagogos**: Ven estudiantes bajo su seguimiento + acceso a notas clínicas
- **Padres**: Solo ven a sus propios hijos

---

## Flujo de Registro

1. Usuario completa formulario en `/professional/register`
2. Selecciona rol: Docente o Psicopedagogo
3. Supabase crea el usuario en `auth.users`
4. Trigger de base de datos crea perfil en `users` table
5. Usuario es redirigido a:
   - `/professional/docente` si es docente
   - `/professional/psicopedagogo` si es psicopedagogo

---

## Solución Temporal: Panel Demo

Si no puedes cambiar la configuración de Supabase, usa el panel demo:

**URL**: `/professional/demo`

Este panel muestra todas las herramientas sin requerir autenticación (solo para desarrollo).

---

## Verificación

### Confirmar que funciona

1. Registra un usuario psicopedagogo
2. Deberías ser redirigido automáticamente a `/professional/psicopedagogo`
3. Deberías ver el dashboard con herramientas completas
4. Si ves "Invalid login credentials", verifica la configuración de Supabase

### Logs útiles

Busca en la consola del navegador:
```
[v0] User created successfully: [ID]
[v0] Redirecting to dashboard...
```

Si ves estos logs pero no puedes acceder, el problema es la confirmación de email.

---

## Contacto

Para problemas técnicos, revisa:
- `/scripts/setup-professional-types.sql` - Configuración de base de datos
- `/lib/professional-utils.ts` - Funciones de roles
- `/app/professional/register/page.tsx` - Flujo de registro
```

```tsx file="" isHidden

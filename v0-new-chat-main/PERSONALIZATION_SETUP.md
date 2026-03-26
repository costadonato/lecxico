# Guía de Personalización Dinámica - Lecxico

## Sistema Implementado

El nombre del usuario se captura automáticamente durante el registro y se persiste en `localStorage`. El dashboard muestra el nombre dinámicamente sin necesidad de recargas.

---

## Archivos Modificados

### 1. **app/register/page.tsx** ✅
- Importa `saveChildName` de `lib/name-storage`
- Llama a `saveChildName(formData.name)` después de guardar el perfil
- **Resultado**: El nombre se guarda automáticamente después del registro

### 2. **app/dashboard/child/page.tsx** ✅
- Usa el hook `useChildName()` de `lib/hooks/use-child-name`
- Renderiza el nombre dinámicamente en el saludo: `Hola, {childName}!`
- **Resultado**: El nombre se muestra automáticamente y persiste al recargar

### 3. **lib/name-storage.ts** ✅
- Funciones de utilidad para guardar/recuperar el nombre
- Dispara eventos personalizados cuando el nombre cambia
- **Ya existía en el proyecto**

### 4. **lib/hooks/use-child-name.ts** ✅ (NUEVO)
- Hook personalizado React
- Carga el nombre desde `localStorage`
- Escucha cambios de nombre en tiempo real
- Proporciona fallback ("Amigo") si no hay nombre guardado

---

## Cómo Usar en Otros Componentes

Para mostrar el nombre personalizado en **cualquier otro componente**:

```tsx
"use client"

import { useChildName } from "@/lib/hooks/use-child-name"

export function MiComponente() {
  const { childName } = useChildName("Amigo") // "Amigo" es el fallback
  
  return (
    <div>
      <h2>Hola, {childName}!</h2>
      {/* resto del componente */}
    </div>
  )
}
```

### Ejemplos de uso:

1. **En encabezados**:
   ```tsx
   <h1>Bienvenido, {childName}!</h1>
   ```

2. **En mensajes personalizados**:
   ```tsx
   <p>¡Excelente trabajo, {childName}! Has completado la lección.</p>
   ```

3. **En el título de la página**:
   ```tsx
   <title>{childName} - Dashboard | Lecxico</title>
   ```

---

## Flujo Completo

```
1. Usuario ingresa nombre en registro
   ↓
2. Formulario valida datos
   ↓
3. Se llama a saveChildName(formData.name)
   ↓
4. Nombre se guarda en localStorage con clave "childName"
   ↓
5. Se dispara evento "childNameChanged"
   ↓
6. Componentes con useChildName() se actualizan automáticamente
   ↓
7. Al recargar la página, el nombre persiste desde localStorage
```

---

## Características

- ✅ **Persistencia**: El nombre se mantiene incluso después de cerrar el navegador
- ✅ **Reactividad**: Componentes se actualizan automáticamente cuando el nombre cambia
- ✅ **Fallback seguro**: Si no hay nombre, muestra "Amigo" o valor personalizado
- ✅ **Sin romper diseño**: Totalmente compatible con el diseño actual
- ✅ **Escalable**: Fácil de usar en nuevos componentes

---

## Próximos Pasos (Opcional)

Si quieres expandir la personalización:

1. **Guardado en Supabase**: Cambiar `localStorage` por la base de datos
2. **Cambio de nombre**: Agregar página de configuración para cambiar el nombre
3. **Más personalizaciones**: Avatar, color favorito, tema, etc.
4. **Sincronización**: Sincronizar datos entre dispositivos

---

## Solución de Problemas

### El nombre no aparece después del registro
- Verifica que `saveChildName()` se está llamando en el submit del formulario
- Abre DevTools → Application → localStorage → busca "childName"

### El nombre desaparece al recargar
- Verifica que el navegador permite localStorage
- Comprueba que no hay script que limpie localStorage

### El hook no funciona en componentes
- Asegúrate de agregar `"use client"` al inicio del componente
- Verifica la ruta de importación: `@/lib/hooks/use-child-name`

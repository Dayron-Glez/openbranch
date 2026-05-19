## 📋 Descripción

Describe brevemente qué hace este PR y por qué es necesario.

---

## 🔗 Issue relacionado

Closes #

---

## 📍 Área afectada

- [ ] 🏠 Landing page
- [ ] 📚 Docs — contenido (MDX)
- [ ] 🎨 Docs — UI / layout
- [ ] 🌐 i18n / locale routing
- [ ] 🔍 Search
- [ ] ⚙️ Config / infraestructura (CI, dependencias, build)

---

## 🏷 Tipo de cambio

- [ ] 🚀 Nueva funcionalidad
- [ ] 🐛 Bug fix
- [ ] 🎨 Style / UI (cambios visuales)
- [ ] ♻️ Refactor (mejora de código sin cambiar funcionalidad)
- [ ] 📚 Contenido (guías, recetas, traducción)
- [ ] 🔧 Chore (config, dependencias, CI/CD)

---

## ✅ Checklist

### General

- [ ] El código compila sin errores (`npm run build` pasa)
- [ ] Sin errores de TypeScript (`npm run types:check` pasa)
- [ ] He probado los cambios manualmente en `npm run dev`
- [ ] No rompe funcionalidad existente

### 🎨 Si toca UI / animaciones

- [ ] Los componentes renderizan correctamente
- [ ] Es responsive (mobile, tablet, desktop)
- [ ] `prefers-reduced-motion` respetado si hay animaciones
- [ ] Sin regresiones visuales en `/` y `/en`

### 📚 Si toca contenido (MDX)

- [ ] El contenido es preciso y accionable
- [ ] Sigue el estilo de escritura del proyecto (conciso, sin relleno)
- [ ] Ambas variantes de idioma actualizadas si aplica (`*.mdx` + `*.en.mdx`)
- [ ] Registrado en `meta.json` / `meta.en.json` si es una guía nueva
- [ ] MDX renderiza sin errores (`npm run build` pasa)

### ⚙️ Si toca config / infraestructura

- [ ] Sin warnings de SonarCloud introducidos
- [ ] Las rutas de i18n siguen funcionando (`/` y `/en`)
- [ ] `GET /llms.txt`, `/og/*`, `/api/search` siguen respondiendo

---

## 📸 Capturas / evidencia

Capturas, GIFs o pasos de validación manual si aplica.

---

## 📝 Notas adicionales

Cualquier contexto adicional para el reviewer.

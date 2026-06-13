# Frontend Tech Stack — Mandatory

This project MUST use **Vue.js 3** for the frontend. No exceptions.

## Allowed

- **Vue.js 3** with Composition API (`<script setup>`, `ref`, `computed`, `watch`)
- **Vue Router** for routing
- **Pinia** for state management
- **Nuxt.js 3** (if SSR/SSG is needed — Nuxt is built on Vue, so this is fine)
- Compatible Vue ecosystem libraries (VueUse, VeeValidate, etc.)

## NOT Allowed

- ❌ **React** (any version)
- ❌ **Next.js**
- ❌ **Angular**
- ❌ **Svelte / SvelteKit**
- ❌ **Solid.js**
- ❌ Any other non-Vue framework

## Why?

The entire project architecture, existing components, design system, and developer workflows are built around the Vue.js ecosystem. Using anything else would require a complete rewrite and break consistency.

## Nuxt Exception

If you choose **Nuxt.js** instead of vanilla Vue, that's acceptable — Nuxt is the official Vue meta-framework and shares the same component model, reactivity system, and ecosystem. Just make sure:
- Pages use `pages/` directory
- State management still uses Pinia
- Components are still standard Vue SFCs

## Summary

| Tech | Status |
|------|--------|
| Vue 3 (Composition API) | ✅ Required |
| Vue Router | ✅ Required |
| Pinia | ✅ Required |
| Nuxt 3 | ✅ Allowed |
| Any non-Vue framework | ❌ Banned |

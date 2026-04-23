<template>
  <router-view />
</template>

<style>
html {
  box-sizing: border-box;
  font-size: 62.5%;
}
*,
*::before,
*::after {
  box-sizing: inherit;
}
body {
  margin: 0;
  background: var(--color-bg-primary, #312e2b);
  color: var(--color-text-boldest, white);
  font-family: 'Chess Sans', system-ui, sans-serif;
  user-select: none;
}
</style>

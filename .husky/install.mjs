// Skip Husky install in production and CI
if (process.env.NODE_ENV === 'production' || process.env.CI === 'true') {
  process.exit(0);
}

// Production installs (`pnpm install --prod`, e.g. the Docker prod-deps stages)
// omit husky itself. There are no git hooks to set up without it, so treat the
// missing package as a no-op rather than failing the install.
let husky;
try {
  husky = (await import('husky')).default;
} catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
  process.exit(0);
}

console.log(husky());

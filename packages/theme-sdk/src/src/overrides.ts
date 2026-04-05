/**
 * @file overrides.ts
 * @description Component override registration helpers for Volqan themes.
 */

import type { ComponentOverride } from '@volqan/core';

/** A map of component names to their override configurations. */
export type ComponentOverrideMap = Record<string, ComponentOverride>;

/**
 * Register a single component override for a named shadcn/ui component.
 *
 * @param componentName - The component name (e.g. "Button", "Card", "Input").
 * @param override - The override configuration.
 * @returns A single-entry ComponentOverrideMap.
 *
 * @example
 * ```ts
 * import { registerComponentOverride } from '@volqan/theme-sdk';
 *
 * const buttonOverride = registerComponentOverride('Button', {
 *   className: 'rounded-full font-semibold',
 * });
 * ```
 */
export function registerComponentOverride(
  componentName: string,
  override: ComponentOverride,
): ComponentOverrideMap {
  return { [componentName]: override };
}

/**
 * Create a component override map from multiple overrides.
 *
 * This is a convenience function that merges multiple
 * {@link registerComponentOverride} results into a single map.
 *
 * @param overrides - Array of [componentName, override] tuples.
 * @returns A merged ComponentOverrideMap.
 *
 * @example
 * ```ts
 * import { createComponentOverrides } from '@volqan/theme-sdk';
 *
 * const overrides = createComponentOverrides([
 *   ['Button', { className: 'rounded-full' }],
 *   ['Card', { cssVars: { '--card-radius': '1rem' }, className: 'shadow-lg' }],
 *   ['Input', { className: 'border-2' }],
 * ]);
 *
 * // Use in defineTheme:
 * defineTheme({
 *   // ...
 *   components: overrides,
 * });
 * ```
 */
export function createComponentOverrides(
  overrides: Array<[componentName: string, override: ComponentOverride]>,
): ComponentOverrideMap {
  const map: ComponentOverrideMap = {};
  for (const [name, override] of overrides) {
    map[name] = override;
  }
  return map;
}

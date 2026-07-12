---
    name: Orval codegen quirks in this workspace
    description: Non-obvious TypeScript friction points when using orval-generated react-query hooks and zod schemas
    ---

    ## Request/response schema naming
    Orval names generated Zod request-body/query-param schemas after the operationId (e.g. `CreateServiceBody`, `ListServicesQueryParams`), not after the OpenAPI component name (e.g. `ServiceInput`, `ListServicesParams`). Before wiring a route, grep the generated file (`lib/api-zod/src/generated/api.ts`) for the real export name rather than assuming it matches the spec's component name.

    **Why:** assuming component-name parity caused repeated import errors across route files.
    **How to apply:** whenever adding a new route that imports a generated Zod schema, grep the generated file first.

    ## useQuery hook `query` option type requires `queryKey`
    The generated `use<Operation>` react-query hooks type their `options.query` field as the full `UseQueryOptions<...>`, which (in this @tanstack/react-query version) has `queryKey` as a required field, not optional. Passing `{ query: { enabled: someBool } }` directly fails typecheck with "Property 'queryKey' is missing".

    **Why:** the orval config in this workspace doesn't emit an `Omit<UseQueryOptions, 'queryKey' | 'queryFn'>` wrapper type for the `query` option.
    **How to apply:** when passing `enabled`/`retry`/etc. to a generated query hook, cast the inner options object `as any` (e.g. `{ query: { enabled: !!x } as any }`) rather than fighting the type. Calling the hook with no options at all (when no override is needed) has no type error.
    
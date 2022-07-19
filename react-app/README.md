# LikeDAO SPA

## Requirements

- NodeJS v16.15.0
- Yarn v1.22.17

These can be installed via `asdf install` if asdf is installed

## Quick Start

```
make setup
make codegen
make dev
```

Visit http://localhost:3000

## Development

### Component folder structure

- Usually, a normal screen will have

```
- src/
  - components/
    - SomeScreen/
      - SomeScreen.graphql <-- GraphQL queries/mutations used in SomeScreen
      - SomeScreen.module.scss <-- styles
      - SomeScreen.tsx <-- the React Component
      - SomeScreenAPI.ts <-- some hooks to encapsulate graphql api call/pagination setup/use cases
      - SomeScreenModel.ts <-- models that shared with others
      - SomeComponentOnlyThatUsedInSomeScreen/
        - SomeComponentOnlyThatUsedInSomeScreen.module.scss
        - SomeComponentOnlyThatUsedInSomeScreen.tsx
```

### Graphql

- Write your operation in the `.graphql` file and run `make codegen`. This will help you generate the necessary types and gql string for the operation

- Use `useGraphQLQuery` / `useLazyGraphQLQuery` / `useGraphQLMutation` because the request state modeling is better then the default that comes with apollo

- You can use the apollo client directly (not necessarily use hooks) if you think it is more proper to have imperative graphql call.

### i18n

1. Add you translation key & string in the [translation files](./src/i18n/translations)
1. Translation key is in the format of `screenName.section.view.content`
1. Use `<LocalizedText>` or `translate` from `useIntl()`
1. Sort the translation by `make sort-translations`

### Theming

The LikeDAO frontend uses Tailwind UI alongside customized colour palette that can be customized in the `tailwind.config.js` file. Existing colours can be modified by changing the colour code, while additional colours added to the file would require changes to code of the related components for them to be functional.

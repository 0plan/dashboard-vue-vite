## File-based Routing

Routes are generated only for `.vue` files. See [page translations](../../locales/README.md) to name a new route and add its Korean and English messages.
Check out [`unplugin-vue-router`](https://github.com/posva/unplugin-vue-router) for more details.

### Path Aliasing

`~/` is aliased to `./src/` folder.

For example, instead of having

```ts
import { isDark } from '../../../../composables'
```

now, you can use

```ts
import { isDark } from '~/composables'
```

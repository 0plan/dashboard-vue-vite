## 페이지 번역 추가

`locales/ko/`와 `locales/en/`에는 같은 이름의 YAML 파일을 둡니다. 헤더의 버튼처럼 여러 페이지가 쓰는 문구는 `common.yml`, 화면별 문구는 라우트 이름과 같은 파일(`login.yml`, `dashboard.yml`, `not-found.yml`)에 넣습니다.

예를 들어 `/settings`를 추가하려면:

1. `src/pages/settings.vue`에 라우트 이름을 지정합니다. `.vue` 파일만 페이지가 되며 기본 레이아웃은 `traffic`입니다.

   ```vue
   <template>
     <h1>{{ $t('settings.title') }}</h1>
   </template>

   <route lang="yaml">
   name: settings
   </route>
   ```

2. `locales/ko/settings.yml`에는 `title: 설정`, `locales/en/settings.yml`에는 `title: Settings`를 추가합니다. 파일 안에서는 `settings:`로 다시 감싸지 않습니다. 보간 변수는 Vue I18n 형식의 `{count}`처럼 양쪽에 같은 이름으로 씁니다.
3. `pnpm exec vitest run`으로 페이지별 파일·키·보간 변수의 일치를 확인합니다. `pnpm dev`에서 새 주소를 열고 언어 전환과 새로고침을 확인하세요. 새 브라우저 컨텍스트의 Network 탭에서 `locales/`로 필터링하면 처음에는 선택 언어의 `common`과 해당 페이지 파일만 보입니다.

`src/modules/i18n.ts`가 인증 리다이렉트 후 확정될 라우트의 리소스를 불러와 Vue I18n에 병합합니다. 이미 방문한 언어와 페이지는 재사용합니다. 고정 경로는 `pnpm build`로 자동 생성되며, 동적 경로를 정적 호스트에서 직접 열려면 `vite.config.ts`의 `ssgOptions.includedRoutes`에 실제 경로를 포함하세요.

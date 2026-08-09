import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Language } from '@libs/entity';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  applicationConfig,
  type Decorator,
  type Preview,
} from '@storybook/angular';

/**
 * Mirrors `ThemeService.apply()`: tokens key off `[data-theme]`, Tailwind's
 * `dark:` variant keys off the `dark` class — both must move together or the
 * page splits into two themes. `dir` is what `provideDocumentLanguage()` does
 * in the app; here it is a toolbar so RTL (Arabic) can be checked per story.
 */
const withThemeAndDirection: Decorator = (story, context) => {
  const theme = (context.globals['theme'] as string) ?? 'light';
  const dir = (context.globals['dir'] as string) ?? 'ltr';

  document.documentElement.dataset['theme'] = theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dir = dir;

  return story();
};

const preview: Preview = {
  decorators: [
    withThemeAndDirection,
    applicationConfig({
      providers: [
        // The app is zoneless; stories must render under the same scheduler.
        provideZonelessChangeDetection(),
        provideHttpClient(),
        // Header renders RouterLinks; an empty config is enough to satisfy them.
        provideRouter([]),
        provideTranslateService({
          // The real bundles, served from `staticDirs` — see `.storybook/main.ts`.
          loader: provideTranslateHttpLoader({
            prefix: './assets/i18n/',
            suffix: '.json',
          }),
          fallbackLang: Language.English,
          lang: Language.English,
        }),
      ],
    }),
  ],
  globalTypes: {
    theme: {
      description: 'Design-token theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    dir: {
      description: 'Text direction — rtl is what Arabic renders under',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'LTR' },
          { value: 'rtl', title: 'RTL' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
    dir: 'ltr',
  },
  parameters: {
    // The token background follows the theme toolbar; a manual background
    // picker would fight it.
    backgrounds: { disable: true },
  },
};

export default preview;

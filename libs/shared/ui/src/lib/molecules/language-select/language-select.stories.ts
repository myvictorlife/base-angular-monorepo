import type { Meta, StoryObj } from '@storybook/angular';
import { LanguageSelectComponent } from './language-select';

/**
 * Fully live: it drives the real `UpdateLanguageService`, and the bundles are
 * the app's own (served via `staticDirs`), so picking a language re-translates
 * every open story. Options are endonyms from `LANGUAGE_METADATA` — they never
 * change with the active language, by design.
 */
const meta: Meta<LanguageSelectComponent> = {
  title: 'Molecules/LanguageSelect',
  component: LanguageSelectComponent,
  argTypes: {
    opened: { action: 'opened' },
  },
};
export default meta;

type Story = StoryObj<LanguageSelectComponent>;

export const Default: Story = {};

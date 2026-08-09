import type { Meta, StoryObj } from '@storybook/angular';
import { PageHeaderComponent } from './page-header';

/**
 * Inputs are i18n keys, resolved against the app's real bundles. Stories only
 * use keys that already exist — a new key here would fail
 * `i18n-completeness.spec.ts` in all eight bundles.
 */
const meta: Meta<PageHeaderComponent> = {
  title: 'Molecules/PageHeader',
  component: PageHeaderComponent,
  argTypes: {
    titleKey: { control: 'text' },
    leadKey: { control: 'text' },
  },
  args: { titleKey: 'SETTINGS.TITLE', leadKey: 'SETTINGS.LEAD' },
};
export default meta;

type Story = StoryObj<PageHeaderComponent>;

export const Playground: Story = {};

export const TitleOnly: Story = {
  args: { titleKey: 'DESIGN.TITLE', leadKey: null },
};

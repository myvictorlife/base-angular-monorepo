import type { Meta, StoryObj } from '@storybook/angular';
import {
  SegmentedControlComponent,
  SegmentedControlOption,
} from './segmented-control';

const THEME_OPTIONS: SegmentedControlOption<string>[] = [
  { value: 'light', labelKey: 'SETTINGS.THEME_LIGHT' },
  { value: 'dark', labelKey: 'SETTINGS.THEME_DARK' },
  { value: 'system', labelKey: 'SETTINGS.THEME_SYSTEM' },
];

/** Endonym labels — plain `label` + `lang`, the settings language picker shape. */
const LANGUAGE_OPTIONS: SegmentedControlOption<string>[] = [
  { value: 'en', label: 'English', lang: 'en' },
  { value: 'pt', label: 'Português', lang: 'pt' },
  { value: 'ar', label: 'العربية', lang: 'ar' },
  { value: 'pl', label: 'Polski', lang: 'pl' },
];

/**
 * Controlled `role="radiogroup"`: the host owns `value`, the control emits
 * `valueChange` and never flips itself. Options label either through an i18n
 * `labelKey` or a literal `label` (+ `lang` for endonyms).
 */
const meta: Meta<SegmentedControlComponent<string>> = {
  title: 'Molecules/SegmentedControl',
  component: SegmentedControlComponent,
  argTypes: {
    valueChange: { action: 'valueChange' },
  },
  args: {
    options: THEME_OPTIONS,
    value: 'light',
    label: 'Theme',
  },
};
export default meta;

type Story = StoryObj<SegmentedControlComponent<string>>;

export const Playground: Story = {};

export const EndonymLabels: Story = {
  args: {
    options: LANGUAGE_OPTIONS,
    value: 'pt',
    label: 'Language',
  },
};

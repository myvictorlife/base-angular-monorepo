import type { Meta, StoryObj } from '@storybook/angular';
import { ThemeToggleComponent } from './theme-toggle';

/**
 * The real thing: it injects the root `ThemeService`, so clicking it flips
 * `data-theme` on this very page — the same attribute the toolbar's Theme
 * switcher drives. Expect the two to fight over the same document; that is
 * faithful to production, where the toggle owns the attribute alone.
 */
const meta: Meta<ThemeToggleComponent> = {
  title: 'Atoms/ThemeToggle',
  component: ThemeToggleComponent,
};
export default meta;

type Story = StoryObj<ThemeToggleComponent>;

export const Default: Story = {};

import type { Meta, StoryObj } from '@storybook/angular';
import { SwitchComponent } from './switch';

/**
 * Controlled component: the host owns the value. The `checked` arg is that
 * host state — flip it in the controls panel, or watch `checkedChange` ask
 * for the opposite in the Actions panel.
 */
const meta: Meta<SwitchComponent> = {
  title: 'Atoms/Switch',
  component: SwitchComponent,
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    checkedChange: { action: 'checkedChange' },
  },
  args: { checked: false, disabled: false, label: 'Reduce motion' },
};
export default meta;

type Story = StoryObj<SwitchComponent>;

export const Playground: Story = {};

export const Checked: Story = {
  args: { checked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

import type { Meta, StoryObj } from '@storybook/angular';
import { CardComponent } from './card';

const PADDINGS = ['none', 'sm', 'md', 'lg'] as const;

const meta: Meta<CardComponent> = {
  title: 'Atoms/Card',
  component: CardComponent,
  render: (args) => ({
    props: args,
    template: `
      <lib-card [padding]="padding" [elevated]="elevated" style="max-width: 24rem">
        A card body. The padding and elevation are the only decisions it makes;
        everything else is content.
      </lib-card>
    `,
  }),
  argTypes: {
    padding: { control: 'select', options: [...PADDINGS] },
    elevated: { control: 'boolean' },
  },
  args: { padding: 'md', elevated: false },
};
export default meta;

type Story = StoryObj<CardComponent>;

export const Playground: Story = {};

/** Header and footer render through the `[card-header]` / `[card-footer]` slots. */
export const WithHeaderAndFooter: Story = {
  render: () => ({
    template: `
      <lib-card style="max-width: 24rem">
        <h3 card-header style="margin: 0; font-weight: var(--font-weight-semibold)">
          Card title
        </h3>
        The body sits between the two slots.
        <span card-footer style="color: var(--color-text-muted); font-size: var(--font-size-sm)">
          Footer note
        </span>
      </lib-card>
    `,
  }),
};

export const Elevated: Story = {
  args: { elevated: true },
};

import type { Meta, StoryObj } from '@storybook/angular';
import { ICON_NAMES, IconComponent } from './icon';

const SIZES = ['sm', 'md', 'lg'] as const;

const meta: Meta<IconComponent> = {
  title: 'Atoms/Icon',
  component: IconComponent,
  render: (args) => ({
    props: args,
    template: `<lib-icon [name]="name" [size]="size" [label]="label" />`,
  }),
  argTypes: {
    name: { control: 'select', options: [...ICON_NAMES] },
    size: { control: 'select', options: [...SIZES] },
    label: { control: 'text' },
  },
  args: { name: 'github', size: 'md', label: null },
};
export default meta;

type Story = StoryObj<IconComponent>;

export const Playground: Story = {};

/** The whole set — a new icon must appear here via `ICON_NAMES`, not by hand. */
export const Gallery: Story = {
  render: () => ({
    props: { icons: ICON_NAMES },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-4)">
        @for (icon of icons; track icon) {
          <figure style="margin: 0; display: grid; justify-items: center; gap: var(--space-1); width: 5.5rem">
            <lib-icon [name]="icon" size="lg" />
            <figcaption style="font-size: var(--font-size-xs); color: var(--color-text-muted)">
              {{ icon }}
            </figcaption>
          </figure>
        }
      </div>
    `,
  }),
};

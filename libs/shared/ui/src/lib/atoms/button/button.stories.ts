import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button';

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

/**
 * Attribute selector (`button[libButton]`, `a[libButton]`), so every story
 * renders through a template — the same way `button.spec.ts` tests it through
 * a host component.
 */
const meta: Meta<ButtonComponent & { disabled: boolean; label: string }> = {
  title: 'Atoms/Button',
  component: ButtonComponent,
  render: (args) => ({
    props: args,
    template: `
      <button
        libButton
        [variant]="variant"
        [size]="size"
        [block]="block"
        [disabled]="disabled"
      >
        {{ label }}
      </button>
    `,
  }),
  argTypes: {
    variant: { control: 'select', options: [...VARIANTS] },
    size: { control: 'select', options: [...SIZES] },
    block: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    variant: 'secondary',
    size: 'md',
    block: false,
    disabled: false,
    label: 'Button',
  },
};
export default meta;

type Story = StoryObj<ButtonComponent & { disabled: boolean; label: string }>;

export const Playground: Story = {};

export const Matrix: Story = {
  render: () => ({
    props: { variants: VARIANTS, sizes: SIZES },
    template: `
      <div style="display: grid; gap: var(--space-3)">
        @for (variant of variants; track variant) {
          <div style="display: flex; gap: var(--space-2); align-items: center">
            @for (size of sizes; track size) {
              <button libButton [variant]="variant" [size]="size">
                {{ variant }} {{ size }}
              </button>
            }
            <button libButton [variant]="variant" disabled>disabled</button>
          </div>
        }
      </div>
    `,
  }),
};

/** The selector also applies to anchors, keeping link-buttons visually identical. */
export const AsLink: Story = {
  render: () => ({
    template: `<a libButton variant="primary" href="#">A link that looks like a button</a>`,
  }),
};

export const Block: Story = {
  args: { block: true, variant: 'primary', label: 'Full-width button' },
};

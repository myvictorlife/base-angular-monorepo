import type { Meta, StoryObj } from '@storybook/angular';
import { SpinnerComponent } from './spinner';

const SIZES = ['sm', 'md', 'lg'] as const;

const meta: Meta<SpinnerComponent> = {
  title: 'Atoms/Spinner',
  component: SpinnerComponent,
  argTypes: {
    size: { control: 'select', options: [...SIZES] },
    label: { control: 'text' },
  },
  args: { size: 'md', label: 'Loading' },
};
export default meta;

type Story = StoryObj<SpinnerComponent>;

export const Playground: Story = {};

export const AllSizes: Story = {
  render: () => ({
    props: { sizes: SIZES },
    template: `
      <div style="display: flex; align-items: center; gap: var(--space-4)">
        @for (size of sizes; track size) {
          <lib-spinner [size]="size" />
        }
      </div>
    `,
  }),
};

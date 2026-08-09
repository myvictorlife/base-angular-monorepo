import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from '../button/button';
import { AlertComponent } from './alert';

const TONES = ['info', 'success', 'warning', 'danger'] as const;

const meta: Meta<AlertComponent> = {
  title: 'Atoms/Alert',
  component: AlertComponent,
  render: (args) => ({
    props: args,
    template: `
      <lib-alert [tone]="tone" [heading]="heading">
        Something happened that you should know about.
      </lib-alert>
    `,
  }),
  argTypes: {
    tone: { control: 'select', options: [...TONES] },
    heading: { control: 'text' },
  },
  args: { tone: 'info', heading: 'Heads up' },
};
export default meta;

type Story = StoryObj<AlertComponent>;

export const Playground: Story = {};

export const AllTones: Story = {
  render: () => ({
    props: { tones: TONES },
    template: `
      <div style="display: grid; gap: var(--space-3)">
        @for (tone of tones; track tone) {
          <lib-alert [tone]="tone" [heading]="tone">
            The {{ tone }} tone. Danger announces assertively; the rest use role="status".
          </lib-alert>
        }
      </div>
    `,
  }),
};

/** The `[alert-actions]` slot carries buttons aligned with the message. */
export const WithActions: Story = {
  render: () => ({
    moduleMetadata: { imports: [ButtonComponent] },
    template: `
      <lib-alert tone="danger" heading="Delete this item?">
        This cannot be undone.
        <button alert-actions libButton variant="danger" size="sm">Delete</button>
      </lib-alert>
    `,
  }),
};

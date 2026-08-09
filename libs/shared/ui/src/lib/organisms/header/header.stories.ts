import type { Meta, StoryObj } from '@storybook/angular';
import { HeaderComponent } from './header';

/**
 * The full bar: brand, nav (RouterLinks against an empty router), the live
 * language select, theme toggle and the conditional GitHub link. Narrow the
 * viewport below the `sm` breakpoint to reach the burger menu.
 */
const meta: Meta<HeaderComponent> = {
  title: 'Organisms/Header',
  component: HeaderComponent,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    repoUrl: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<HeaderComponent>;

/** A clone with no `config/site.json`: no GitHub affordance anywhere. */
export const Default: Story = {
  args: { repoUrl: null },
};

/** With a configured repository the icon joins the utility cluster. */
export const WithRepoLink: Story = {
  args: { repoUrl: 'https://github.com/acme/repo' },
};

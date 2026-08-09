import { Component, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import {
  TranslateLoader,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import {
  SegmentedControlComponent,
  SegmentedControlOption,
} from './segmented-control';

class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({ THEME: { LIGHT: 'Light', DARK: 'Dark' } });
  }
}

const OPTIONS: SegmentedControlOption[] = [
  { value: 'light', labelKey: 'THEME.LIGHT' },
  { value: 'dark', labelKey: 'THEME.DARK' },
  { value: 'pt', label: 'Português', lang: 'pt' },
];

@Component({
  imports: [SegmentedControlComponent],
  template: `<lib-segmented-control
    [options]="options"
    [value]="value()"
    label="Theme"
    (valueChange)="onChange($event)"
  />`,
})
class HostComponent {
  readonly options = OPTIONS;
  readonly value = signal<string | null>('light');
  readonly onChange = vi.fn();
}

describe('SegmentedControlComponent', () => {
  let spectator: Spectator<HostComponent>;

  const createComponent = createComponentFactory({
    component: HostComponent,
    providers: [
      provideTranslateService({
        loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
        lang: 'en',
        fallbackLang: 'en',
      }),
    ],
  });

  const segments = () =>
    spectator.queryAll('button[role="radio"]') as HTMLButtonElement[];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- index bounds asserted by the length check
  const segment = (i: number) => segments()[i]!;

  beforeEach(() => {
    spectator = createComponent();
    spectator.detectChanges();
  });

  it('renders one labelled radio per option inside a named group', () => {
    expect(
      spectator.query('[role="radiogroup"]')?.getAttribute('aria-label'),
    ).toBe('Theme');
    expect(segments()).toHaveLength(3);
    expect(segment(0)).toHaveText('Light');
  });

  it('renders pre-resolved labels verbatim, with their language tag', () => {
    expect(segment(2)).toHaveText('Português');
    expect(segment(2).getAttribute('lang')).toBe('pt');
    expect(segment(0).getAttribute('lang')).toBeNull();
  });

  it('marks only the current value as checked', () => {
    expect(segment(0).getAttribute('aria-checked')).toBe('true');
    expect(segment(0).classList).toContain('segmented__segment--active');
    expect(segment(1).getAttribute('aria-checked')).toBe('false');
  });

  it('asks for a segment on click without selecting itself', () => {
    spectator.click(segment(1));

    expect(spectator.component.onChange).toHaveBeenCalledWith('dark');
    // Controlled component: the host decides — the checked segment is unchanged.
    expect(segment(0).getAttribute('aria-checked')).toBe('true');
  });

  it('ignores a click on the already-selected segment', () => {
    spectator.click(segment(0));

    expect(spectator.component.onChange).not.toHaveBeenCalled();
  });

  it('follows the value input', () => {
    spectator.component.value.set('dark');
    spectator.detectChanges();

    expect(segment(1).getAttribute('aria-checked')).toBe('true');
    expect(segment(0).getAttribute('aria-checked')).toBe('false');
  });
});

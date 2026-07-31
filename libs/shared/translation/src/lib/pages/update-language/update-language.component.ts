import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { UpdateLanguageService } from '../../core/update-language.service';
import { readStoredLanguage } from '../../core/language-storage';
import { Language } from '@libs/entity';

@Component({
    selector: 'lib-update-language',
    templateUrl: 'update-language.component.html',
    styleUrls: ['update-language.component.scss'],
    imports: [
        ReactiveFormsModule,
        TranslatePipe
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdateLanguageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly updateLanguageService = inject(UpdateLanguageService);
  private readonly router = inject(Router);

  readonly languages = [
    { code: Language.English, text: 'English' },
    { code: Language.Dutch, text: 'Dutch' },
    { code: Language.French, text: 'French' },
    { code: Language.Portuguese, text: 'Português' }
  ];

  readonly languageForm: FormGroup = this.formBuilder.group({
    language: [readStoredLanguage()]
  });

  confirmLanguageSelection(): void {
    const selectedLanguage: Language = this.languageForm.get('language')?.value;
    // ngx-translate v18 swaps the active language reactively — no page reload needed.
    this.updateLanguageService.changeLanguage(selectedLanguage);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

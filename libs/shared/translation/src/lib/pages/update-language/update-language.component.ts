import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UpdateLanguageService } from '../../core/update-language.service';
import { Language } from '@libs/entity';

@Component({
    selector: 'lib-update-language',
    templateUrl: 'update-language.component.html',
    styleUrls: ['update-language.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule
    ],
    providers: [
        UpdateLanguageService
    ]
})
export class UpdateLanguageComponent {
  private readonly translate = inject(TranslateService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly updateLanguageService = inject(UpdateLanguageService);
  private readonly router = inject(Router);

  languages = [
    { code: Language.English, text: 'English' },
    { code: Language.Dutch, text: 'Dutch' },
    { code: Language.French, text: 'French' }
  ];

  languageForm: FormGroup;
  selectedLanguage: string | null;

  constructor() {
    this.selectedLanguage = localStorage.getItem('language');
    this.languageForm = this.formBuilder.group({
      language: [this.selectedLanguage]
    });
  }

  confirmLanguageSelection() {
    const selectedLanguage = this.languageForm.get('language')?.value;
    this.updateLanguageService.changeLanguage(selectedLanguage);
    window.location.reload();
  }

  getBackTextWithTranslation() {
    return this.translate.instant('BACK');
  }

  trackByLang = (lang: { code: string; text: string }) => lang.code;

  goBack() {
    const backPath = localStorage.getItem('backUpdateLanguagePath');
    if (backPath) {
      this.router.navigate([backPath]);
    } else {
      this.router.navigate(['/']);
    }
  }
}

import { inject, Injectable } from "@angular/core";
import { Language } from "@libs/entity";
import { TranslateService } from "@ngx-translate/core";

@Injectable()
export class UpdateLanguageService {
    private readonly translate = inject(TranslateService);


    private readonly supportedLanguages = [Language.English, Language.Dutch, Language.French] as const;

    initLanguage() {
        if (!this.translate) return;
        this.translate.setDefaultLang(Language.English);
        const saved = localStorage.getItem('language');
        const initial = saved && this.supportedLanguages.includes(saved as Language)
            ? saved
            : Language.English;
        this.translate.use(initial);
        localStorage.setItem('language', initial);
    }
    changeLanguage(language: string) {
        this.translate.use(language);
        localStorage.setItem('language', language);
    }
}
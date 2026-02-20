import { Injectable, inject } from "@angular/core";
import { Language } from "@libs/entity";
import { TranslateService } from "@ngx-translate/core";

@Injectable()
export class UpdateLanguageService {
    private readonly translate = inject(TranslateService);


    initLanguage() {
        const currentLanguage = Language.English;
        if(this.translate) {
            this.translate.setDefaultLang(currentLanguage);
            this.translate.use(currentLanguage);
            this.changeLanguage(currentLanguage);
        }
    }
    changeLanguage(language: string) {
        this.translate.use(language);
        localStorage.setItem('language', language);
    }
}
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule, inject } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateStore } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { UpdateLanguageService } from './core/update-language.service';
import { TranslateDirective } from './directive/translate.directive';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    HttpClientModule,
    TranslateDirective,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    TranslateStore,
    UpdateLanguageService
  ],
  exports: [TranslateDirective, TranslateModule]
})
export class TranslationLibModule {
  private readonly updateLanguageService = inject(UpdateLanguageService);

  constructor() {
    this.updateLanguageService.initLanguage();
  }

}

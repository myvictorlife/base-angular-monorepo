import { Directive, Input, ElementRef, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Directive({
  selector: '[translate]',
  standalone: true
})
export class TranslateDirective implements OnInit, OnChanges {
  private translateService = inject(TranslateService);
  private el = inject(ElementRef);

  @Input('translate') key = '';
  @Input() translateParams: any;

  ngOnInit() {
    this.translate();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['key'] || changes['translateParams']) {
      this.translate();
    }
  }

  private translate() {
    const translateKey = this.key || this.el.nativeElement.textContent.trim();
    if (!translateKey.length) return;
    debugger
    this.translateService.get(translateKey, this.translateParams).subscribe((translation) => {
      this.el.nativeElement.textContent = translation;
    });
  }
}

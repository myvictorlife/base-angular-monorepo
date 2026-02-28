import { Component, input } from '@angular/core';
import { User } from '@libs/entity';
import { TranslationLibModule } from '@libs/translation';

@Component({
  selector: 'lib-user-info',
  imports: [TranslationLibModule],
  templateUrl: './user-info.html',
  styleUrls: ['./user-info.scss'],
})
export class UserInfoComponent {
  user = input<User>();
}

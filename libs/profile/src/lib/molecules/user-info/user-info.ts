import { Component, input } from '@angular/core';
import { User } from '@libs/entity';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'lib-user-info',
  imports: [TranslatePipe],
  templateUrl: './user-info.html',
  styleUrls: ['./user-info.scss'],
})
export class UserInfoComponent {
  user = input<User>();
}

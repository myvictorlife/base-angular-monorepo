import { Component, input } from '@angular/core';
import { User } from '@libs/entity';

@Component({
  selector: 'lib-user-info',
  imports: [],
  templateUrl: './user-info.html',
  styleUrls: ['./user-info.scss'],
})
export class UserInfoComponent {
  user = input<User>();
}

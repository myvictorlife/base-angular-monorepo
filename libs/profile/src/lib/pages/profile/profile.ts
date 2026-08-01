import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertComponent,
  ButtonComponent,
  CardComponent,
  IconComponent,
  SpinnerComponent,
} from '@libs/ui';
import { TranslatePipe } from '@ngx-translate/core';
import { ProfileStore } from '../../+state/profile.store';
import { UserInfoComponent } from '../../molecules/user-info/user-info';

@Component({
  selector: 'lib-profile',
  imports: [
    AlertComponent,
    ButtonComponent,
    CardComponent,
    IconComponent,
    SpinnerComponent,
    UserInfoComponent,
    TranslatePipe,
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  private readonly store = inject(ProfileStore);
  private readonly router = inject(Router);

  // Read straight off the store: these are already signals, so there is no
  // selector layer and nothing to unsubscribe from.
  readonly profile = this.store.profile;
  readonly loading = this.store.loading;
  readonly errorMessage = this.store.errorMessage;

  constructor() {
    this.loadProfile();
  }

  loadProfile(): void {
    this.store.fetchProfile();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}

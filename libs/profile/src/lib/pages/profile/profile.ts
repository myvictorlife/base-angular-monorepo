import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { fetchProfile } from '../../+state/profile/profile.actions';
import { selectProfile } from '../../+state/profile/profile.selectors';
import { UserInfoComponent } from '../../molecules/user-info/user-info';

@Component({
  selector: 'lib-profile',
  imports: [UserInfoComponent, TranslatePipe],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {

  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly profile = this.store.selectSignal(selectProfile);

  constructor() {
    this.loadProfile();
  }

  loadProfile(): void {
    this.store.dispatch(fetchProfile());
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}

import { Component, inject } from '@angular/core';
import { UserInfoComponent } from '../../molecules/user-info/user-info';
import { ProfileStateModule } from '../../+state/profile/profile.module';
import { Store } from '@ngrx/store';
import { fetchProfile } from '../../+state/profile/profile.actions';
import { selectProfile } from '../../+state/profile/profile.selectors';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-profile',
  imports: [UserInfoComponent, ProfileStateModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class Profile {

  private readonly store = inject(Store);
  private readonly router = inject(Router);

  profile = this.store.selectSignal(selectProfile);

  constructor() {
    this.loadProfile();
  }

  loadProfile() {
    this.store.dispatch(fetchProfile());
  }

  goHome() {
    this.router.navigate(['/']);
  }
}

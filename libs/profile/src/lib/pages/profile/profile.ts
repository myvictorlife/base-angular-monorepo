import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslationLibModule } from '@libs/translation';
import { fetchProfile } from '../../+state/profile/profile.actions';
import { selectProfile } from '../../+state/profile/profile.selectors';
import { ProfileStateModule } from '../../+state/profile/profile.module';
import { UserInfoComponent } from '../../molecules/user-info/user-info';

@Component({
  selector: 'lib-profile',
  imports: [UserInfoComponent, ProfileStateModule, TranslationLibModule],
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

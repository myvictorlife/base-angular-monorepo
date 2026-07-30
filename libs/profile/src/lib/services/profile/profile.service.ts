import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '@libs/entity';
import { Observable, of } from 'rxjs';

@Injectable()
export class ProfileService {

  httpClient = inject(HttpClient);

  /**
   * Stubbed until a real backend exists. To wire it up, import `commonPaths` and
   * `environment` from '@libs/environment' and return:
   *   this.httpClient.get<User>(environment.baseUrl + commonPaths.profile.fetchProfile)
   */
  fetchProfile(): Observable<User> {
    return of({
      id: '123',
      name: 'John Doe'
    });
  }
}

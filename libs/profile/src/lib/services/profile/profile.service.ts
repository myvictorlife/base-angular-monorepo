import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { commonPaths, environment } from '@libs/environment';
import { User } from '@libs/entity';
import { Observable, of } from 'rxjs';

@Injectable()
export class ProfileService {

  httpClient = inject(HttpClient);

  fetchProfile(): Observable<User> {
    // const baseUrl = environment.baseUrl;
    // const path = commonPaths.profile.fetchProfile;
    // return this.httpClient.get<User>(baseUrl + path);
    return of({
      id: '123',
      name: 'John Doe'
    });
  }
}

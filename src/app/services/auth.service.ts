import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl = environment.API_URL;
  constructor(
    private http: HttpClient
  ) { }

  login(username: string, password: string){
    const url = `${this.apiUrl}/Login/loginAntiDirectory`;
    return this.http.post(url, {username, password});
  }
}

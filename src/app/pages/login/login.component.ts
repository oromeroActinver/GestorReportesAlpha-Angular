import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { AuthService } from './AuthService';
import { LoginResponse} from './LoginResponse';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit(): void {

    if (!this.username || !this.password) {
      this.errorMessage = 'Usuario y contraseña son requeridos.';
      return;
    }

      this.authService.login(this.username, this.password).subscribe(
        (response: LoginResponse) => {
          if (response.exist) {
            localStorage.setItem('token', response.token);
            this.router.navigate(['/home']); 
            console.log('Redirigiendo a /home');
          } else {
            this.router.navigate(['/']);
          }
        },
        (error: any) => { 
          this.errorMessage = error ;
          ;
        }
      );
    
  }
  
  

}
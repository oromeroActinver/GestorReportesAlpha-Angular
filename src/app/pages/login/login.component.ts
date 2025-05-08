import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { AuthService } from './AuthService';
import { LoginResponse} from './LoginResponse';
import { HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MessageDetailsDialogComponent } from '../message-details-dialog/message-details-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router,
    private dialog: MatDialog
  ) { }

  onSubmit(): void {
    this.isLoading = true;
    if (!this.username || !this.password) {
      this.isLoading = false;
      this.showDialog('FAILED', 'Usuario y contraseña son requeridos.');
      return;
    }

      this.authService.login(this.username, this.password).subscribe(
        (response: LoginResponse) => {
          this.isLoading = false;
          if (response.exist) {
            localStorage.setItem('token', response.token);
            this.router.navigate(['/home']); 
          } else {
            this.isLoading = false;
            this.router.navigate(['/']);
          }
        },
        (error: any) => { 
          this.showDialog('FAILED', 'Usuario o contraseña inválidos.');
          this.isLoading = false;
          ;
        }
      );
    
  }
  
  showDialog(title: string, content: string, details?: string[]): void {
    this.dialog.open(MessageDetailsDialogComponent, {
      width: '300px',
      data: { messageTitle: title, messageContent: content, details: details }
    });
  }

}
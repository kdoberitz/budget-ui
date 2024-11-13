import { Component, inject } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { logoGithub, logoGoogle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonRow } from '@ionic/angular/standalone';

interface LoginProvider {
  name: string;
  logo: string;
  loginMethod: (callback: () => Promise<boolean>) => void;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [IonContent, IonGrid, IonRow, IonCol, IonButton, IonIcon]
})
export default class LoginComponent {
  // DI
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginProviders: LoginProvider[] = [
    { name: 'GitHub', logo: 'logo-github', loginMethod: this.authService.loginWithGithub },
    { name: 'Google', logo: 'logo-google', loginMethod: this.authService.loginWithGoogle }
  ];

  constructor() {
    addIcons({ logoGithub, logoGoogle });
  }

  login(loginProvider: LoginProvider): void {
    const returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] ?? '/';
    loginProvider.loginMethod(() => this.router.navigateByUrl(returnUrl));
  }
}

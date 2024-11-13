import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { ToastController } from '@ionic/angular/standalone';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { loginPath } from '../app.routes';
import { addIcons } from 'ionicons';
import { alertCircle } from 'ionicons/icons';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly fireauth = inject(AngularFireAuth);
  private readonly toast = inject(ToastController);
  private readonly router = inject(Router);

  constructor() {
    addIcons({ alertCircle });
  }

  currentUser = (): Observable<firebase.User | null> => this.fireauth.user;

  loginWithGithub = (next?: () => void): void => this.login(new firebase.auth.GithubAuthProvider(), next);

  loginWithGoogle = (next?: () => void): void => this.login(new firebase.auth.GoogleAuthProvider(), next);

  logout = (): Promise<boolean> => this.fireauth.signOut().then(() => this.router.navigate([loginPath]));

  // --------------
  // Helper methods
  // --------------

  private login(authProvider: firebase.auth.AuthProvider, next?: () => void): void {
    from(this.fireauth.signInWithPopup(authProvider)).subscribe({
      next: next || (() => {}),
      error: error => this.handleLoginError(error)
    });
  }

  private handleLoginError(error: firebase.auth.Error): void {
    // Ignore errors from closed login popups
    if (error.code === 'auth/cancelled-popup-request') return;

    // Log error & display toast
    console.error(error);
    this.toast
      .create({
        message: error.message,
        duration: 5000,
        position: 'bottom',
        color: 'danger',
        icon: 'alert-circle'
      })
      .then(toast => toast.present());
  }
}

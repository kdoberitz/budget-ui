import { Component, inject } from '@angular/core';
import { addIcons } from 'ionicons';
import { analytics, logOut, podium, pricetag } from 'ionicons/icons';
import { categoriesPath } from './category/category.routes';
import { expensesPath } from './expense/expense.routes';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonAvatar,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonFooter,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonRouterOutlet,
  IonSplitPane,
  IonToolbar
} from '@ionic/angular/standalone';
import { AuthService } from './shared/service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    RouterLinkActive,

    // Ionic
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonLabel,
    IonChip,
    IonAvatar,
    IonNote,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonFooter,
    IonToolbar,
    IonButtons,
    IonButton,
    IonRouterOutlet
  ]
})
export default class AppComponent {
  // DI
  readonly authService = inject(AuthService);
  readonly appPages = [
    { title: 'Expenses', url: `/${expensesPath}`, icon: 'podium' },
    { title: 'Categories', url: `/${categoriesPath}`, icon: 'pricetag' }
  ];
  constructor() {
    // Add all used Ionic icons
    addIcons({ analytics, logOut, podium, pricetag });
  }
}

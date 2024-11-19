import { Component, inject } from '@angular/core';
import {
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
  ModalController,
  ViewDidEnter
} from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, alertCircleOutline, search, swapVertical } from 'ionicons/icons';
import CategoryModalComponent from '../../component/category-modal/category-modal.component';
import { CategoryService } from '../../service/category.service';
import { ToastService } from '../../../shared/service/toast.service';
import { Category, CategoryCriteria } from '../../../shared/domain';
import { finalize } from 'rxjs';
import { InfiniteScrollCustomEvent, RefresherCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,

    // Ionic
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonProgressBar,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonLabel,
    IonSkeletonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonFab,
    IonFabButton,
    IonList
  ]
})
export default class CategoryListComponent implements ViewDidEnter {
  // DI
  private readonly categoryService = inject(CategoryService);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastService = inject(ToastService);

  categories: Category[] | null = null;
  readonly initialSort = 'name,asc';
  lastPageReached = false;
  loading = false;
  searchCriteria: CategoryCriteria = { page: 0, size: 25, sort: this.initialSort };

  constructor() {
    // Add all used Ionic icons
    addIcons({ swapVertical, search, alertCircleOutline, add });
  }

  ionViewDidEnter(): void {
    this.loadCategories();
  }

  private loadCategories(next?: () => void): void {
    if (!this.searchCriteria.name) delete this.searchCriteria.name;
    this.loading = true;
    this.categoryService
      .getCategories(this.searchCriteria)
      .pipe(
        finalize(() => {
          this.loading = false;
          if (next) next();
        })
      )
      .subscribe({
        next: categories => {
          if (this.searchCriteria.page === 0 || !this.categories) this.categories = [];
          this.categories.push(...categories.content);
          this.lastPageReached = categories.last;
        },
        error: error => this.toastService.displayWarningToast('Could not load categories', error)
      });
  }

  async openModal(): Promise<void> {
    const modal = await this.modalCtrl.create({ component: CategoryModalComponent });
    modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'refresh') this.reloadCategories();
  }

  loadNextCategoryPage($event: InfiniteScrollCustomEvent) {
    this.searchCriteria.page++;
    this.loadCategories(() => $event.target.complete());
  }

  reloadCategories($event?: RefresherCustomEvent): void {
    this.searchCriteria.page = 0;
    this.loadCategories(() => $event?.target.complete());
  }
}

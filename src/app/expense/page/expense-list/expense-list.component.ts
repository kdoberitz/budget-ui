import { Component, inject } from '@angular/core';
import { addMonths, set } from 'date-fns';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonItem,
  IonItemDivider,
  IonItemGroup,
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
  ViewDidEnter,
  ViewDidLeave
} from '@ionic/angular/standalone';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, alertCircleOutline, arrowBack, arrowForward, pricetag, search, swapVertical } from 'ionicons/icons';
import { CurrencyPipe, DatePipe } from '@angular/common';
import ExpenseModalComponent from '../../component/expense-modal/expense-modal.component';
import { ToastService } from '../../../shared/service/toast.service';
import { Category, Expense, ExpenseCriteria, SortOption } from '../../../shared/domain';
import { ExpenseService } from '../../service/expense.service';
import { debounce, finalize, from, groupBy, interval, mergeMap, Subscription, toArray } from 'rxjs';
import { InfiniteScrollCustomEvent, RefresherCustomEvent } from '@ionic/angular';
import { formatPeriod } from '../../../shared/period';
import { CategoryService } from '../../../category/service/category.service';

interface ExpenseGroup {
  date: string;
  expenses: Expense[];
}

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
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
    IonList,
    IonItemGroup,
    IonItemDivider,
    IonLabel,
    IonSkeletonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonFab,
    IonFabButton,
    IonFooter,
    IonButton
  ]
})
export default class ExpenseListComponent implements ViewDidEnter, ViewDidLeave {
  // DI
  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoryService);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastService = inject(ToastService);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  categories: Category[] | null = null;
  expenses: Expense[] | null = null;
  readonly initialSort = 'date';
  lastPageReached = false;
  loading = false;
  searchCriteria: ExpenseCriteria = { page: 0, size: 25, sort: this.initialSort };

  date = set(new Date(), { date: 1 });

  expenseGroups: ExpenseGroup[] | null = null;

  private searchFormSubscription?: Subscription;
  readonly sortOptions: SortOption[] = [
    { label: 'Created at (newest first)', value: 'createdAt,desc' },
    { label: 'Created at (oldest first)', value: 'createdAt,asc' },
    { label: 'Date (oldest first)', value: 'date,asc' },
    { label: 'Date (newest first', value: 'date,desc' },
    { label: 'Name (A-Z)', value: 'name,asc' },
    { label: 'Name (Z-A)', value: 'name,desc' }
  ];

  readonly searchForm = this.formBuilder.group({ name: [''], sort: [this.initialSort], categoryIds: [[]] });

  constructor() {
    // Add all used Ionic icons
    addIcons({ swapVertical, pricetag, search, alertCircleOutline, add, arrowBack, arrowForward });
  }

  ionViewDidEnter(): void {
    this.loadExpenses();
    this.loadAllCategories();
    this.searchFormSubscription = this.searchForm.valueChanges
      .pipe(debounce(searchParams => interval(searchParams.name?.length ? 400 : 0)))
      .subscribe(searchParams => {
        this.searchCriteria = { ...this.searchCriteria, ...searchParams, page: 0 };
        this.loadExpenses();
      });
  }

  ionViewDidLeave(): void {
    this.searchFormSubscription?.unsubscribe();
    this.searchFormSubscription = undefined;
  }

  private loadExpenses(next: () => void = () => {}): void {
    this.searchCriteria.yearMonth = formatPeriod(this.date);
    if (!this.searchCriteria.categoryIds?.length) delete this.searchCriteria.categoryIds;
    if (!this.searchCriteria.name) delete this.searchCriteria.name;
    this.loading = true;
    const groupByDate = this.searchCriteria.sort.startsWith('date');
    this.expenseService
      .getExpenses(this.searchCriteria)
      .pipe(
        finalize(() => (this.loading = false)),
        mergeMap(expensePage => {
          this.lastPageReached = expensePage.last;
          next();
          if (this.searchCriteria.page === 0 || !this.expenseGroups) this.expenseGroups = [];
          return from(expensePage.content).pipe(
            groupBy(expense => (groupByDate ? expense.date : expense.id)),
            mergeMap(group => group.pipe(toArray()))
          );
        })
      )
      .subscribe({
        next: (expenses: Expense[]) => {
          const expenseGroup: ExpenseGroup = {
            date: expenses[0].date,
            expenses: this.sortExpenses(expenses)
          };
          const expenseGroupWithSameDate = this.expenseGroups!.find(other => other.date === expenseGroup.date);
          if (!expenseGroupWithSameDate || !groupByDate) this.expenseGroups!.push(expenseGroup);
          else expenseGroupWithSameDate.expenses = this.sortExpenses([...expenseGroupWithSameDate.expenses, ...expenseGroup.expenses]);
        },
        error: error => this.toastService.displayWarningToast('Could not load expenses', error)
      });
  }

  private loadAllCategories(): void {
    this.categoryService.getAllCategories({ sort: 'name,asc' }).subscribe({
      next: categories => (this.categories = categories),
      error: error => this.toastService.displayWarningToast('Could not load categories', error)
    });
  }

  private sortExpenses = (expenses: Expense[]): Expense[] => expenses.sort((a, b) => a.name.localeCompare(b.name));

  async openExpenseModal(expense?: Expense) {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: { expense: expense ?? {} }
    });
    await modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'refresh') this.reloadExpenses();
  }

  loadNextExpensePage($event: InfiniteScrollCustomEvent) {
    this.searchCriteria.page++;
    this.loadExpenses(() => $event.target.complete());
  }

  reloadExpenses($event?: RefresherCustomEvent): void {
    this.searchCriteria.page = 0;
    this.loadExpenses(() => $event?.target.complete());
  }

  addMonths = (number: number): void => {
    this.date = addMonths(this.date, number);
    this.loadExpenses();
  };
}

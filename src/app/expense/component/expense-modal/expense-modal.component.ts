import { Component, inject, Input, ViewChild } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  ModalController,
  ViewDidEnter,
  ViewWillEnter
} from '@ionic/angular/standalone';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, calendar, cash, close, pricetag, save, text, trash } from 'ionicons/icons';
import { ExpenseService } from '../../service/expense.service';
import { LoadingIndicatorService } from '../../../shared/service/loading-indicator.service';
import { ToastService } from '../../../shared/service/toast.service';
import { Category, Expense, ExpenseUpsertDto } from '../../../shared/domain';
import { finalize } from 'rxjs';
import CategoryModalComponent from '../../../category/component/category-modal/category-modal.component';
import { formatISO, parseISO } from 'date-fns';
import { CategoryService } from '../../../category/service/category.service';
// import { ActionSheetService } from '../../../shared/service/action-sheet.service';

@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,

    // Ionic
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonChip,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonNote,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
    IonFab,
    IonFabButton
  ]
})
export default class ExpenseModalComponent implements ViewWillEnter, ViewDidEnter {
  // DI
  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoryService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly loadingIndicatorService = inject(LoadingIndicatorService);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastService = inject(ToastService);
  // private readonly actionSheetService = inject(ActionSheetService);

  readonly expenseForm = this.formBuilder.group({
    id: [null! as string],
    name: ['', [Validators.required, Validators.maxLength(40)]],
    amount: [null! as number, [Validators.required, Validators.min(0)]],
    categoryID: [null! as string],
    date: [formatISO(new Date(), { representation: 'date' }), [Validators.required]]
  });

  @ViewChild('nameInput') nameInput?: IonInput;

  // Passed into the component by the ModalController, available in the ionViewWillEnter
  @Input() expense: Expense = {} as Expense;

  categories: Category[] = [];

  constructor() {
    // Add all used Ionic icons
    addIcons({ close, save, text, pricetag, add, cash, calendar, trash });
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    this.loadingIndicatorService.showLoadingIndicator({ message: 'Saving expense' }).subscribe(loadingIndicator => {
      const expense = {
        ...this.expenseForm.value,
        date: formatISO(parseISO(this.expenseForm.value.date!), { representation: 'date' })
      } as ExpenseUpsertDto;
      this.expenseService
        .upsertExpense(expense)
        .pipe(finalize(() => loadingIndicator.dismiss()))
        .subscribe({
          next: () => {
            this.toastService.displaySuccessToast('Expense saved');
            this.modalCtrl.dismiss(null, 'refresh');
          },
          error: error => this.toastService.displayWarningToast('Could not save expense', error)
        });
    });
  }

  delete(): void {
    this.modalCtrl.dismiss(null, 'delete');
  }

  async showCategoryModal(): Promise<void> {
    const categoryModal = await this.modalCtrl.create({ component: CategoryModalComponent });
    categoryModal.present();
    const { role } = await categoryModal.onWillDismiss();
    console.log('role', role);
    this.loadAllCategories();
  }

  private loadAllCategories(): void {
    this.categoryService.getAllCategories({ sort: 'name,asc' }).subscribe({
      next: categories => (this.categories = categories),
      error: error => this.toastService.displayWarningToast('Could not load categories', error)
    });
  }

  ionViewWillEnter(): void {
    this.loadAllCategories();
  }

  ionViewDidEnter(): void {
    this.nameInput?.setFocus();
  }
}

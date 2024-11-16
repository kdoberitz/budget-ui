import { inject, Injectable } from '@angular/core';
import { ActionSheetController, ActionSheetOptions } from '@ionic/angular/standalone';
import { filter, from, Observable } from 'rxjs';
import { close, refresh, trash } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Injectable({ providedIn: 'root' })
export class ActionSheetService {
  private readonly actionSheetCtrl = inject(ActionSheetController);

  constructor() {
    addIcons({ close, trash, refresh });
  }

  showUpdateConfirmation = (): Observable<void> =>
    this.showActionSheet(
      {
        header: 'Update Available',
        subHeader: 'An update is available for installation. Would you like to update now? Unsaved changes will be lost!',
        buttons: [
          { text: 'Update', data: { action: 'update' }, icon: 'refresh' },
          { text: 'Cancel', role: 'cancel', data: { action: 'cancel' }, icon: 'close' }
        ]
      },
      'update'
    );

  showDeletionConfirmation = (message: string): Observable<void> =>
    this.showActionSheet(
      {
        header: 'Confirm Deletion',
        subHeader: message,
        buttons: [
          { text: 'Delete', role: 'destructive', data: { action: 'delete' }, icon: 'trash' },
          { text: 'Cancel', role: 'cancel', data: { action: 'cancel' }, icon: 'close' }
        ]
      },
      'delete'
    );

  // --------------
  // Helper methods
  // --------------

  private readonly showActionSheet = (actionSheetOptions: ActionSheetOptions, actionRole: string): Observable<void> =>
    from(
      this.actionSheetCtrl
        .create(actionSheetOptions)
        .then(actionSheet => {
          actionSheet.present();
          return actionSheet.onDidDismiss();
        })
        .then(({ data }) => data?.action)
    ).pipe(filter(action => action === actionRole));
}

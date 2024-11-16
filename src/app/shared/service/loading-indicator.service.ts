import { inject, Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular/standalone';
import { LoadingOptions } from '@ionic/core/dist/types/components/loading/loading-interface';
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingIndicatorService {
  private readonly loadingController = inject(LoadingController);

  showLoadingIndicator = (options: LoadingOptions): Observable<HTMLIonLoadingElement> =>
    from(
      this.loadingController.create(options).then(loading => {
        loading.present();
        return loading;
      })
    );
}

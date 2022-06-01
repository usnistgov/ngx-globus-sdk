import { ModuleWithProviders, NgModule } from '@angular/core';
import { Configuration } from './models/configuration.model';
import { NgxGlobusSdkService } from './ngx-globus-sdk.service';



@NgModule({
  declarations: [
  ],
  imports: [
  ],
  exports: [
  ]
})
export class NgxGlobusSdkModule { 

  static forRoot(configuration: Configuration): ModuleWithProviders<NgxGlobusSdkModule> {
    return {
      ngModule: NgxGlobusSdkModule,
      providers: [NgxGlobusSdkService, { provide: 'config', useValue: configuration }]
    };
  }

}


import { FormsModule } from '@angular/forms';
import { NgModule, ErrorHandler } from '@angular/core';

import { CommonModule } from '@angular/common';
import { LoggOperatorService } from './logg-operator.service';
import { LoggBrowserComponent } from './logg-browser/logg-browser.component';
import { MapToIterable } from './logg-browser/Iterable.pipe';
import { GlobalErrorHandlerService } from './global-error-handler.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  providers : [
    LoggOperatorService, 
    GlobalErrorHandlerService,
    // перопределили  встроенный ErrorHandler на наш класс (по умолчанию ошибки в консоль выводятся)
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService }
  ],
  exports: [LoggBrowserComponent],
  declarations: [LoggBrowserComponent, MapToIterable]
})
export class LoggModule { }

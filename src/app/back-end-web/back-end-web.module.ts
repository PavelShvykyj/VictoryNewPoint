import { ClockModule } from './../clock/clock.module';
import { NgModule, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule }    from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestManagerService } from './request-manager.service';
import { SmsManagerService } from './sms-manager.service';
import { WebInterceptorService } from './web-interceptor.service'

const DEFAULT_TIMEOUT = new InjectionToken<number>('DEFAULT_TIMEOUT');

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    ClockModule,
  ],
  providers : [RequestManagerService,
    SmsManagerService,
    WebInterceptorService,
    {
    provide  : HTTP_INTERCEPTORS,
    useClass : WebInterceptorService,
    multi : true
  },
  {
    provide  : DEFAULT_TIMEOUT,
    useValue : 30000
  }
  ],
  declarations: []
})
export class BackEndWebModule { }

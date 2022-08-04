import { ClockModule } from './clock/clock.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router'

import { AppComponent } from './app.component';
import { HallBrowserModule } from './HallBrowser/HallBrowser.module';
import { HallComponent } from './HallBrowser/hall/hall.component';
import { MessagesComponent } from './HallBrowser/messages/messages.component';
import { TicketPrintWievComponent } from './HallBrowser/ticket-print-wiev/ticket-print-wiev.component';
import { BackEndRouterModule } from './back-end-router/back-end-router.module';

import { BackEndWebModule } from './back-end-web/back-end-web.module';
import { LoggInModule } from './logg-in/logg-in.module';
import { LogginComponent } from './logg-in/loggin/loggin.component';
import { LoggModule } from './logg/logg.module'
import { LoggBrowserComponent } from './logg/logg-browser/logg-browser.component'
import { BackEndLocalModule } from './back-end-local/back-end-local.module'
import { HallResolver } from './HallBrowser/hall/hall.resolver';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const routes = [
    {path : '' , component : LogginComponent},
    {path : 'Log' , component : LoggBrowserComponent},       
    {path : 'Hall' , component : HallComponent ,  resolve : {halldata : HallResolver}},       
];

@NgModule({
  declarations: [
    AppComponent
    
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, {useHash : true}),
    HallBrowserModule,
    BackEndRouterModule,
    BackEndWebModule,
    BackEndLocalModule,
    LoggModule,
    LoggInModule,
    ClockModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

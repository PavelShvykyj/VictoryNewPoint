import { ShopModule } from './../shop/shop.module';
import { ClockModule } from './../clock/clock.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HallComponent } from './hall/hall.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { HallChairComponent } from './hall-chair/hall-chair.component';
import { MovieSelectorComponent } from './movie-selector/movie-selector.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MovieComponent } from './movie/movie.component';
import { MoviePriceComponent } from './movie-price/movie-price.component';
import { TicketPrintWievComponent } from './ticket-print-wiev/ticket-print-wiev.component';
import { ReservingOperationsComponent } from './reserving-operations/reserving-operations.component';
import { CancelOperationComponent } from './cancel-operation/cancel-operation.component';
import { MessagesComponent } from './messages/messages.component';
import { SearchingOperationsComponent } from './searching-operations/searching-operations.component'
import { PermissionsService } from "./permissions.service";
import { HallResolver } from './hall/hall.resolver';

@NgModule({
  imports: [
    CommonModule,
    AngularFontAwesomeModule,
    FormsModule, 
    ReactiveFormsModule,
    ClockModule,
    ShopModule
  ],
  declarations: [HallComponent, HallChairComponent, MovieSelectorComponent, MovieComponent, MoviePriceComponent, TicketPrintWievComponent, ReservingOperationsComponent, CancelOperationComponent, MessagesComponent, SearchingOperationsComponent],
  exports: [HallComponent,MessagesComponent],
  providers : [PermissionsService,HallResolver]
})
export class HallBrowserModule { }

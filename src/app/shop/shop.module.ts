import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderComponent } from './order/order.component';
import { OrderTotalComponent } from './order-total/order-total.component';
import { OrderStateService } from './order-state.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  providers: [OrderStateService],
  declarations: [OrderComponent, OrderTotalComponent],
  exports: [OrderComponent, OrderTotalComponent]
})
export class ShopModule { }

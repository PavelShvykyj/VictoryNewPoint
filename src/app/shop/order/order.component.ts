import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { IOrder, OrderStateService } from '../order-state.service';
import { RequestRouterService } from '../../back-end-router/request-router.service';
import { faGlasses, faRestroom } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  order$: Observable<IOrder>;

  icones = {
    "glasses": faGlasses,
    "restroom": faRestroom
  }

  constructor(private shop: OrderStateService,
    private apiServis: RequestRouterService) { 
      this.order$ = this.shop.order$;
    }

  ngOnInit() {
    
  }

  onQuantityChange(id: number, quantity: number) {
    this.shop.AddQuantity(id, quantity);
  }

  onCancel() {
    this.shop.ClearOrder();
  }

  onShopSale() {
    this.apiServis.RoutShopSale();
  }
}

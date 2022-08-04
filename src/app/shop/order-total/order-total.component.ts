import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { OrderStateService } from '../order-state.service';

@Component({
  selector: 'app-order-total',
  templateUrl: './order-total.component.html',
  styleUrls: ['./order-total.component.css']
})
export class OrderTotalComponent implements OnInit {

  total$ : Observable<number>

  constructor(private shop: OrderStateService) { }

  ngOnInit() {
    this.total$ = this.shop.ordertotal$
  }

}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';


export interface IOrderItem {
  id : number,
  name : string,
  icon_name : string,
  price : number,
  quantity : number
}

export interface IOrder {
  items : {[key: number]: IOrderItem},
  ids : number[]
}




@Injectable()
export class OrderStateService {

  private _orderState : IOrder = this.GetInitialState();
  private order  = new BehaviorSubject<IOrder>(this._orderState); 
  public  order$ :Observable<IOrder>  = this.order.asObservable().pipe(share());
  public ordertotal$ : Observable<number> = this.order$.pipe(map(el=> {
    let summ = 0;
    el.ids.forEach(id=> {summ = summ + el.items[id].price*el.items[id].quantity });
    return summ;
  }),share()); 

  constructor() { 
  }


  GetInitialState() : IOrder {
    return {
      items : {
        0: {
          id: 0,
          name: "Visit restroom",
          price: 5,
          quantity:0,
          icon_name:"restroom"
        },
        1: {
          id: 0,
          name: "3D glasses",
          price: 20,
          quantity:0,
          icon_name:"glasses"
        },
      },
      ids : [0,1]
    }
  }

  AddQuantity(id: number, quantity : number) {
    if (this._orderState.ids.find(el=>{return el===id}) === undefined) {
      return
    }
    let order = {... this._orderState};
    const newquantity = order.items[id].quantity+quantity;
    order.items[id].quantity = newquantity < 0 ? 0 : newquantity;
    this._orderState = order;
    this.order.next(this._orderState);
  }

  ClearOrder() {
    this._orderState = this.GetInitialState();
    this.order.next(this._orderState);
  }

  GetOrderSnapshot() : IOrder {
    return {...this._orderState}
  }

}

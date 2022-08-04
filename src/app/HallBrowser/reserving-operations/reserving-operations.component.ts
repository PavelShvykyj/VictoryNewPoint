import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input, Output, QueryList, EventEmitter, ViewChild} from '@angular/core';
import { MessagesComponent } from '../messages/messages.component';

import { ISessionData,
  ISyncTicketsRequestViewModel,
  IChairsStatusInSessionInfo,
  IChairStateViewModelInternal,
  ICurrentSessionInfo,
  ISyncTicketsResponseViewModelInternal,
  IHallInfo, 
  IGetHallResponseViewModel,
  ITicketCategoryPriceViewModel} from '../../iback-end';


enum FormActions {
  print,
  reserve,
  pay,
  search,
  searchByPhone,
  nothing
}


@Component({
  selector: 'reserving-operations',
  templateUrl: './reserving-operations.component.html',
  styleUrls: ['./reserving-operations.component.css']
})
export class ReservingOperationsComponent implements OnInit {
  
  @Output() ActionSearchEmmiter = new EventEmitter();
  @Output() ActionSearchByPhoneEmmiter = new EventEmitter();
  @Output() ReserveActionPrintEmmiter = new EventEmitter();
  @Output() ReserveActionPayEmmiter = new EventEmitter();
  @Output() ReserveActionReserveEmmiter = new EventEmitter();
  @Output() ActionReseteEmmiter = new EventEmitter();
  
  @ViewChild(MessagesComponent) messagesComponent : MessagesComponent;

  FORM_ACTIONS : typeof FormActions = FormActions;  
  form : FormGroup;
  action : number = FormActions.nothing;  

  constructor() { 
    this.form   = new FormGroup({
      phone : new FormControl('',[Validators.required,
                                   Validators.minLength(10),
                                   Validators.pattern(RegExp(/^\d+$/))]) ,
      secretCode :  new FormControl('',[Validators.required,
                                        Validators.minLength(6),
                                        Validators.pattern(RegExp(/^\d+$/))])
    })   
  }

  ngOnInit() {
  }

  Resete(){
    this.action = FormActions.nothing;
    this.ActionReseteEmmiter.emit();
    this.messagesComponent.ClearMessages();
  }

  ShowMessage(message: string, imp : number ){
    this.messagesComponent.AddMessage(message, imp);
  }

  get phone(){
    return this.form.get('phone');
  }

  SetPhone(value: string){
    this.phone.setValue(value)
  }
 
  get secretCode(){
    return this.form.get('secretCode');
  }

  SetSecretCode(value: string){
    this.secretCode.setValue(value)
  }


  InputOnFocus(){    
    this.action = FormActions.nothing;
  }

  GetFormValidStatus() : boolean{
    switch (this.action) {
      case FormActions.nothing:
        return true;
      case FormActions.pay:
        return this.phone.valid || this.secretCode.valid;
      case FormActions.print:
        return  this.phone.valid && this.secretCode.valid;
      case FormActions.reserve:
        return  this.phone.valid;
      case FormActions.search:
        return  this.secretCode.valid;
      case FormActions.searchByPhone:
        return  this.phone.valid;

    }
  }

  Search(){  
    this.action = FormActions.search;
    if(!this.GetFormValidStatus()) {
      return;
    }
    this.ActionSearchEmmiter.emit(this.form.value)
  }

  SearchByPhone(){  
    this.action = FormActions.searchByPhone;
    if(!this.GetFormValidStatus()) {
      return;
    }
    this.ActionSearchByPhoneEmmiter.emit(this.form.value)
  }


  Print(){    
    this.action = FormActions.print;
    if(!this.GetFormValidStatus()) {
      return;
    }
    this.ReserveActionPrintEmmiter.emit(this.form.value)
  }

  Reserve(){   
    this.action = FormActions.reserve;
    if(!this.GetFormValidStatus()) {
      return;
    }
    this.ReserveActionReserveEmmiter.emit(this.form.value)
  }

  Pay(){    
    this.action = FormActions.pay;
    if(!this.GetFormValidStatus()) {
      return;
    }
    this.ReserveActionPayEmmiter.emit(this.form.value)
  }


}

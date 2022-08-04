import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input, Output, QueryList, EventEmitter,ViewChild} from '@angular/core';
import { HallChairComponent } from '../hall-chair/hall-chair.component';
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
  confirm,
  search,
  searchByPhone,
  nothing
}

@Component({
  selector: 'cancel-operation',
  templateUrl: './cancel-operation.component.html',
  styleUrls: ['./cancel-operation.component.css']
})
export class CancelOperationComponent implements OnInit {

  @Output() CancelActionCancelEmmiter = new EventEmitter();
  @Output() ActionSearchEmmiter = new EventEmitter();
  @Output() ActionSearchByPhoneEmmiter = new EventEmitter();
  @Output() CancelActionReseteEmmiter = new EventEmitter();
  @ViewChild(MessagesComponent) messagesComponent : MessagesComponent;

  FORM_ACTIONS : typeof FormActions = FormActions;  
  form : FormGroup;
  action : number = FormActions.nothing;  

  constructor() { 
    this.form   = new FormGroup({
      confirm : new FormControl('',[Validators.required,
                                   Validators.pattern(RegExp(/\+/))]), 
      phone : new FormControl('',[Validators.required,
                                    Validators.minLength(10),
                                    Validators.pattern(RegExp(/^\d+$/))]),
      secretCode :  new FormControl('',[Validators.required,
                                         Validators.minLength(6),
                                         Validators.pattern(RegExp(/^\d+$/))])
                                  }); 


  }

  ngOnInit() {
  }

  InputOnFocus(){    
    this.action = FormActions.nothing;
  }

  get confirm(){
    return this.form.get('confirm');
  }
  
  SetConfirm(value: string){
    this.confirm.setValue(value)
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


  GetFormValidStatus() : boolean{
    switch (this.action) {
      case FormActions.nothing:
        return true;
      case FormActions.confirm:
        return this.confirm.valid;
      case FormActions.search:
        return  this.secretCode.valid;
      case FormActions.searchByPhone:
        return  this.phone.valid;
    }
  }

  Confirm(WithPay : boolean){
    this.action = FormActions.confirm;
    if(!this.GetFormValidStatus()) {
      return;
    }
    this.CancelActionCancelEmmiter.emit(WithPay);
    this.action = FormActions.nothing;
    this.SetConfirm('');
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

  Resete(){
    this.action = FormActions.nothing;
    this.CancelActionReseteEmmiter.emit();
  }

  ShowMessage(message: string, imp : number ){
    this.messagesComponent.AddMessage(message, imp);
  }


}

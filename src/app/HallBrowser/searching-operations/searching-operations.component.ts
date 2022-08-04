import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input, Output, QueryList, EventEmitter} from '@angular/core';
import { HallChairComponent } from '../hall-chair/hall-chair.component';

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
  search,
  searchByPhone,
  nothing
}


@Component({
  selector: 'searching-operations',
  templateUrl: './searching-operations.component.html',
  styleUrls: ['./searching-operations.component.css']
})
export class SearchingOperationsComponent implements OnInit {
  @Output() ActionSearchEmmiter = new EventEmitter();
  @Output() ActionSearchByPhoneEmmiter = new EventEmitter();
  @Output() ActionReseteEmmiter = new EventEmitter();

  FORM_ACTIONS : typeof FormActions = FormActions;  
  form : FormGroup;
  action : number = FormActions.nothing;  

  constructor() { 
    this.form   = new FormGroup({
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

  Resete(){
    this.action = FormActions.nothing;
    this.ActionReseteEmmiter.emit();
  }

}

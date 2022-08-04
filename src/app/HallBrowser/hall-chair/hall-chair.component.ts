import { Component, OnInit, OnChanges, Input, Output ,EventEmitter ,ChangeDetectionStrategy  } from '@angular/core';
import { IdataObject } from '../idata-object'
import { AngularFontAwesomeComponent } from 'angular-font-awesome'
import {IChairStatus,IChairStateViewModelInternal}  from '../../iback-end'
import { HallShowStatus } from '../../global_enums'


@Component({
  selector: 'hall-chair',
  templateUrl: './hall-chair.component.html',
  styleUrls: ['./hall-chair.component.css']
})
export class HallChairComponent implements OnInit, OnChanges {
  
  showHallStatus : typeof HallShowStatus = HallShowStatus;
  @Input() chairID : number;
  @Input() rowID : number;
  @Input() showStatus : number = this.showHallStatus.Defoult;  
  @Input() chairStateInternal : IChairStateViewModelInternal;
  @Input() isAvailable : boolean = true;

  @Output() chairSelectStatusChange = new EventEmitter();

  isMousOn : boolean = false;


  constructor() { 
   
  }

  ngOnInit() {
    this.chairStateInternal = {
      s : this.ChairStatusDefoult(),
      t : "",
      p : 0,
      c : {
            r : +this.rowID,
            c : +this.chairID
          } 
    }    
  }

  ngOnChanges(){}

  OnClick(){
    console.log('chair data',this.rowID,this.chairID,this.isAvailable);
    if (!this.isAvailable) {
      return
    }
    
    if (this.chairStateInternal.s.isFree && !(this.showStatus == HallShowStatus.Cancel  || this.showStatus == HallShowStatus.StartSale || this.showStatus == HallShowStatus.Search))
    {
      
      this.chairStateInternal.s.isFree = false;
      this.chairStateInternal.s.isSelected = !this.chairStateInternal.s.isSelected;
      this.chairSelectStatusChange.emit(this.chairStateInternal);
      
    }
    else if(this.showStatus == HallShowStatus.Cancel  && !this.chairStateInternal.s.isFree) {
      
      this.chairStateInternal.s.isFree = false;
      this.chairStateInternal.s.isSelected = !this.chairStateInternal.s.isSelected;
      this.chairSelectStatusChange.emit(this.chairStateInternal);
    }  
    else if(this.showStatus == HallShowStatus.Search  && !this.chairStateInternal.s.isFree) {
      
      this.chairStateInternal.s.isFree = false;
      this.chairStateInternal.s.isSelected = !this.chairStateInternal.s.isSelected;
      this.chairSelectStatusChange.emit(this.chairStateInternal);
    }  
    
    else if(this.showStatus == HallShowStatus.Reserving && this.chairStateInternal.s.isReserved) {
      
      this.chairStateInternal.s.isFree = false;
      this.chairStateInternal.s.isSelected = !this.chairStateInternal.s.isSelected;
      this.chairSelectStatusChange.emit(this.chairStateInternal);
    }

    else if (this.chairStateInternal.s.isSelected && !(this.chairStateInternal.s.isSoled || 
      this.chairStateInternal.s.isReserved || 
      this.chairStateInternal.s.inReserving))
    {
      
      this.chairStateInternal.s.isFree = true;
      this.chairStateInternal.s.isSelected = false;
      this.chairSelectStatusChange.emit(this.chairStateInternal);
    }
  }

  ChairStatusDefoult() : IChairStatus {
   let status = { isFree     : true,
    inReserving              : false,   
    isReserved               : false, 
    isSoled                  : false, 
    isSelected               : false,
    iniciator                : -1,
    idTicketCategory         : 0};
    return status
  }
  
  Onmouseover() {
    this.isMousOn = true;
  }
  
  Onmouseout() {
    this.isMousOn = false;
  }

}

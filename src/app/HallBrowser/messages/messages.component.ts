import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { IdataObject } from '../idata-object';
import { MessageSate } from '../../global_enums'

@Component({
  selector: 'messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  @Input() historyLenth : number = 5;
  form = new FormGroup({messages : new FormArray([])})

  controlsImpotent : Array<IdataObject> = []

  messageSate : typeof MessageSate = MessageSate;

  constructor() { }

  ngOnInit() {
  }

  get Messages(){
    return this.form.get('messages') as FormArray;
  }

  AddMessage(Message : string , impotent : number){
    let formMessages =  this.Messages;
    let message = new FormControl(Message);
    formMessages.push(message);
    let messageIpotent = {control :  message,
                          impotent : impotent}
    this.controlsImpotent.push(messageIpotent)

    if(formMessages.controls.length > this.historyLenth){
      this.controlsImpotent.splice(0,1);
      formMessages.removeAt(0);
    }
  }

  ClearMessages(){
    let formMessages =  this.Messages;
    while(formMessages.controls.length != 0){
      formMessages.removeAt(0);
    }
    this.controlsImpotent = [];
  }

  DeleteMessage(message : FormControl){
    let formMessages =  this.Messages;
    let element = this.controlsImpotent.find(function(el) {return el.control == message});
    this.controlsImpotent.splice(this.controlsImpotent.indexOf(element),1)
    formMessages.removeAt(formMessages.controls.indexOf(message));
  }
}

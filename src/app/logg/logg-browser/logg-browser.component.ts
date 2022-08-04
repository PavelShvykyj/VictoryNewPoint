import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoggOperatorService } from '../logg-operator.service';
import {  Subscription } from 'rxjs';
import { RequestRouterService } from '../../back-end-router/request-router.service';
import { IdataObject } from '../../HallBrowser/idata-object';
import { LoggMessageTypes } from '../../global_enums'
import { IloggObject } from '../../ilogg';

@Component({
  selector: 'logg-browser',
  templateUrl: './logg-browser.component.html',
  styleUrls: ['./logg-browser.component.css']
})
export class LoggBrowserComponent implements OnInit, OnDestroy {

  takeLogFiles : number = 1;
  skipLogFiles : number = 0;
  loggObjSubs : Subscription;    
  loggObj : Array<IloggObject> = [];
  LoggMessageTypes: typeof LoggMessageTypes = LoggMessageTypes;

  constructor(private loggServise : LoggOperatorService, private apiServise : RequestRouterService ) {
  }

  ngOnInit() {
    this.loggObjSubs = this.loggServise.log$.subscribe(message =>{
      this.loggObj.push(message) 
    });
    this.UpdateLog();
  }

  ngOnDestroy() {
    this.loggServise.AVTO_SAVE = true;
    this.loggObjSubs.unsubscribe()
  }
  
  UpdateLog(){
    this.loggObj = this.loggServise.LoggObj;
  }
  
  ClearLog(){
    this.loggServise.AVTO_SAVE = true;
    this.loggServise.ClearLog();
    this.UpdateLog();
  }

  SaveLog(){
    if (this.loggServise.AVTO_SAVE)
    {
      this.apiServise.RoutSaveLogg()
      this.ClearLog();
    }
  }

  GetLastLogFiles(){
    this.loggServise.AVTO_SAVE = false;
    this.apiServise.RoutTakeLoggFiles(this.takeLogFiles,this.skipLogFiles)
  }

  PreviousFile(){
    
    if(this.skipLogFiles == 0){
      return
    }

    this.ClearLog();
    this.skipLogFiles = this.skipLogFiles-1;
    this.GetLastLogFiles()
  }

  NextFile(){
    this.ClearLog();
    this.skipLogFiles = this.skipLogFiles+1;
    this.GetLastLogFiles()
  }
}

import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { IdataObject } from '../HallBrowser/idata-object';
import { LoggMessageTypes } from '../global_enums'
import { IloggObject } from '../ilogg';


@Injectable()
export class LoggOperatorService {

  private _log = new Subject<IloggObject>();
  private _logObject :  Array<IloggObject> = []; 

  log$ : Observable<IloggObject> = this._log.asObservable();
  LOGG_ON : boolean = true;
  AVTO_SAVE : boolean = true;

  SetLoggMessage(loggMessage : IloggObject) {
    if (!this.LOGG_ON) { return }
    this._logObject.push(loggMessage);
    this._log.next(loggMessage);
  }

  public get LoggObj() : Array<IloggObject> {
    return this._logObject;
  }
  
  public set LoggObj(valLogObject: Array<IloggObject>) {
    this._logObject = valLogObject;
  }
  

  ClearLog(){
    if (!this.LOGG_ON) { return }
    this._logObject = [];
    //this._log.next({action : 'Logg cleared'});
  }
}

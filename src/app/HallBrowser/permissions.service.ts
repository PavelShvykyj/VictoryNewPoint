import { ICurrentSessionInfo } from './../iback-end';
import { Injectable } from '@angular/core';
import { IAction, IPermission, IActionParams, IUserAccess } from "../ipermissions";
import { ActionType, LoggMessageTypes } from "../global_enums";
import { RequestManagerService as localManagerServise } from '../back-end-local/request-manager.service';
import { IloggObject, IloggParametr } from '../ilogg';

class UserAccessChecker implements IUserAccess {
  readonly userPermissions: Array<IPermission>;

  constructor(Permissions: Array<IPermission>, private localServise: localManagerServise) {
    this.userPermissions = Permissions;
  }

  private AfterSessionStart(permission: IPermission, action: IAction): boolean {
    if (permission.value) { // если доступ разрешен то не важно выполнилось условие или нет
      return true
    }
    let TimeLenth: number = permission.parametrs.find(element => { return element.name == 'MinutesLeft' }).value;
    let context: ICurrentSessionInfo = action.context.value;
    let SessionStart =  context.currentSession.starts;
    let Minutes : number = +SessionStart.slice(14,16);
    
    let EndMinutes : number = Minutes + TimeLenth*1;

    let MaxDate = new Date(
      +SessionStart.slice(0,4),
      +SessionStart.slice(5,7)-1,
      +SessionStart.slice(8,10),
      +SessionStart.slice(11,13),
      EndMinutes , 0);
  
    let CurrDate = new Date();
 
    // this.SetLoggMessageMetod('DatePart',[{
    //   name: 'DatePart', body :{
    //    y: +SessionStart.slice(0,4),
    //    m: +SessionStart.slice(5,7),
    //    d: +SessionStart.slice(8,10),
    //    h: +SessionStart.slice(11,13),
    //    min: +SessionStart.slice(14,16),
    //    tl : TimeLenth,
    //    EndMinutes : EndMinutes 
    //     }}])  
 
    //  this.SetLoggMessageMetod('AfterSessionStart',[{name: permission.name, body :{CurrDate : CurrDate, MaxDate : MaxDate , SessionStart: SessionStart }}])
    
    return CurrDate < MaxDate;

  }

  private AfterSessionStartReserve(permission: IPermission, action: IAction): boolean {
    if (permission.value) { // если доступ разрешен то не важно выполнилось условие или нет
      return true
    }
    let TimeLenth: number = permission.parametrs.find(element => { return element.name == 'MinutesLeft' }).value;
    let context: ICurrentSessionInfo = action.context.value;
    let SessionStart =  context.currentSession.starts;
    let Minutes : number = +SessionStart.slice(14,16);
    
    let EndMinutes : number = Minutes + TimeLenth*1;

    let MaxDate = new Date(
      +SessionStart.slice(0,4),
      +SessionStart.slice(5,7)-1,
      +SessionStart.slice(8,10),
      +SessionStart.slice(11,13),
      EndMinutes , 0);
  
    let CurrDate = new Date();
 
    // this.SetLoggMessageMetod('DatePart',[{
    //   name: 'DatePart', body :{
    //    y: +SessionStart.slice(0,4),
    //    m: +SessionStart.slice(5,7),
    //    d: +SessionStart.slice(8,10),
    //    h: +SessionStart.slice(11,13),
    //    min: +SessionStart.slice(14,16),
    //    tl : TimeLenth,
    //    EndMinutes : EndMinutes 
    //     }}])  
 
    //  this.SetLoggMessageMetod('AfterSessionStart',[{name: permission.name, body :{CurrDate : CurrDate, MaxDate : MaxDate , SessionStart: SessionStart }}])
    
    return CurrDate < MaxDate;
  }

  private AfterSessionStartCancel(permission: IPermission, action: IAction): boolean {
    if (permission.value) { // если доступ разрешен то не важно выполнилось условие или нет
      return true
    }
    let TimeLenth: number = permission.parametrs.find(element => { return element.name == 'MinutesLeft' }).value;
    let context: ICurrentSessionInfo = action.context.value;
    let SessionStart =  context.currentSession.starts;
    let Minutes : number = +SessionStart.slice(14,16);
    
    let EndMinutes : number = Minutes + TimeLenth*1;

    let MaxDate = new Date(
      +SessionStart.slice(0,4),
      +SessionStart.slice(5,7)-1,
      +SessionStart.slice(8,10),
      +SessionStart.slice(11,13),
      EndMinutes , 0);
  
    let CurrDate = new Date();
 
    // this.SetLoggMessageMetod('DatePart',[{
    //   name: 'DatePart', body :{
    //    y: +SessionStart.slice(0,4),
    //    m: +SessionStart.slice(5,7),
    //    d: +SessionStart.slice(8,10),
    //    h: +SessionStart.slice(11,13),
    //    min: +SessionStart.slice(14,16),
    //    tl : TimeLenth,
    //    EndMinutes : EndMinutes 
    //     }}])  
 
    //  this.SetLoggMessageMetod('AfterSessionStart',[{name: permission.name, body :{CurrDate : CurrDate, MaxDate : MaxDate , SessionStart: SessionStart }}])
    
    return CurrDate < MaxDate;
  }

   CheckAction(permission: IPermission, action: IAction): boolean {
    switch (permission.name) {
      case 'AfterSessionStart':
        return this.AfterSessionStart(permission, action);
      case 'AfterSessionStartReserve':
        return this.AfterSessionStartReserve(permission, action);
      case 'AfterSessionStartCancel':
          return this.AfterSessionStartCancel(permission, action);
      default:
        break;
    }
    return false;
  }

  CheckPermission(action: IAction): boolean {
    let Passed = true;
    // если запускаем не из 1С то неоткуда взять параметры и права 
    // т.е. пропускаем любое действие
    if(this.localServise.LOCAL_SERVISE_BLOCED) {
      return Passed;
    }
    
    
    this.userPermissions.forEach(permission => {
      let CanCheck: boolean = permission.actions.filter(element => { return element == action.type }).length > 0;
      this.SetLoggMessageMetod('CanCheck',[{name: permission.name, body :{actiontype : action.type, result : CanCheck , value: permission.value }}])
      if (CanCheck) {
        Passed = Passed && this.CheckAction(permission, action);
      }
    });
    return Passed
  }

  SetLoggMessage(logMessage: IloggObject) {
    this.localServise.SetLoggMessage(logMessage);
  }

  SetLoggMessageMetod(metodName: string, metodParams: Array<IloggParametr>) {
    let logMessage: IloggObject = {
      message_date: new Date(),
      message_type: LoggMessageTypes.Metod,
      message_name: metodName,
      message_parametr: metodParams
    }
    this.SetLoggMessage(logMessage)
  }

}

export class Action implements IAction {
  readonly type: ActionType
  readonly context: IActionParams
  constructor(parametrs: IActionParams, action: ActionType) {
    this.context = parametrs;
    this.type = action;
  }
}

@Injectable()
export class PermissionsService {

  private _userAccessChecker: IUserAccess;

  public set userPermissions(Permissions: Array<IPermission>) {
    this._userAccessChecker = new UserAccessChecker(Permissions, this.localServise);
  }

  CheckPermission(action: IAction): boolean {
    return this._userAccessChecker.CheckPermission(action);
  }

  SetLoggMessage(logMessage: IloggObject) {
    this.localServise.SetLoggMessage(logMessage);
  }

  SetLoggMessageMetod(metodName: string, metodParams: Array<IloggParametr>) {
    let logMessage: IloggObject = {
      message_date: new Date(),
      message_type: LoggMessageTypes.Metod,
      message_name: metodName,
      message_parametr: metodParams
    }
    this.SetLoggMessage(logMessage)
  }

  constructor(private localServise: localManagerServise) {
    this.userPermissions = [];
   }

}

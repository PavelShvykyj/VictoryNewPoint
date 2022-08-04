import { PermissionsService } from './../HallBrowser/permissions.service';
import { SmsManagerService } from './../back-end-web/sms-manager.service';
import { Injectable, Input } from '@angular/core';
import { RequestManagerService as webManagerServise  } from '../back-end-web/request-manager.service';
import { WebInterceptorService as WebInterceptor  } from '../back-end-web/web-interceptor.service';
import { RequestManagerService as localManagerServise } from '../back-end-local/request-manager.service';

import {
  IbackEnd,
  ILoggInData,
  IResponseData,
  IChairsStatusInSessionInfo,
  IChairStateViewModelInternal,
  ICancelTicketRequestViewModel,
  ISessionData,
  ISyncTicketsRequestViewModel,
  ISyncTicketsResponseViewModelInternal,
  IHallInfo,
  IDataFrom1C
} from '../iback-end'
import { LoggMessageTypes } from '../global_enums'
import { IloggObject, IloggParametr } from '../ilogg';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/merge';
import * as _ from 'underscore';
import { IdataObject } from '../HallBrowser/idata-object';
import { async } from '@angular/core/testing';
import { OrderStateService } from '../shop/order-state.service';




@Injectable()
export class RequestRouterService {
  private backends: Array<IbackEnd> = [];
  private emitChangeLoginName = new Subject<string>();
  private emitChangeBackEndName = new Subject<string>();
  changeHallState$: Observable<IChairsStatusInSessionInfo>;
  changeEmittedLoginName$ = this.emitChangeLoginName.asObservable();
  changeEmittedBackEndName$ = this.emitChangeBackEndName.asObservable();
  internalErrors = [400, 401, 403, 406, 0];
  @Input() currentBackEndName: string


  constructor(private webServise: webManagerServise,
              private localServise: localManagerServise,
              private smsSevise : SmsManagerService, private permissionServise : PermissionsService,
              private shopServise : OrderStateService
               ) {
    this.backends.push(this.webServise);
    this.backends.push(this.localServise);
    this.changeHallState$ = Observable.merge(this.webServise.changeHallState$, this.localServise.changeHallState$);
  }

  IsInternalError(status) {
    let foundError = _.find(this.internalErrors, elemrnt => { return status == elemrnt })
    if (foundError) {
      return true
    }
    else {
      return false
    }
  }

  EmitLoginName(change: string) {
    this.emitChangeLoginName.next(change);
  }

  EmitBackEndName(change: string) {
    this.emitChangeBackEndName.next(change);
  }

  SelectBackEnd(): IbackEnd {
    return this.backends[0];
  }

  RoutLoggInByPass(userdata: ILoggInData): Promise<IResponseData> {

    // логинимся по данным веб т.е.
    // получаем данные логг и заходим с ними авоматом для 1С логин всегда успешен ибо мы уже зашли
    // в случае когда заходим от 1С порядок зеркальный 
    // c1userdata = this.c1Servise.GetData(userdata);
    // this.c1Servise.LoggInByPass(c1userdata).then()
    // сообщаем успех 1С  


    let LocalUserData: ILoggInData = this.webServise.getUserData();
    this.EmitBackEndName("1C");
    this.EmitLoginName(LocalUserData.userName);

    return this.webServise.LoggInByPass(userdata)
      .then(resoult => {
        if (resoult.status == "200") {
          this.EmitBackEndName("WEB");
          this.EmitLoginName(userdata.userName);
        }
        return resoult
      }).catch(err => { throw err;
      } );
  }

  RoutLoggInByLocal(): Promise<IResponseData> {

    // 1C логин всегда успех подумать как тут получить правильное имя юзера
    this.EmitBackEndName("1C");
    this.EmitLoginName(this.localServise.getLocalUserName());

    let WebUserData: ILoggInData = this.localServise.getUserData();

    return this.webServise.LoggInByPass(WebUserData)
      .then(resoult => {
        if (resoult.status == "200") {
          this.EmitBackEndName("WEB");
          this.EmitLoginName(WebUserData.userName);
        }
        return resoult
      });
  }

  RoutSessionsGetByDate(selectedDate: string): Promise<ISessionData> | null {
    if (this.currentBackEndName == "1C") {
      return this.RoutLoggInByLocal().then(res => {
        return this.SessionsGetByDate(selectedDate);
      }).catch(res => {
        return this.SessionsGetByDate(selectedDate);
      });
    }
    else {
      return this.SessionsGetByDate(selectedDate);
    }
  }

  private SessionsGetByDate(selectedDate: string): Promise<ISessionData> | null {
    return this.webServise.SessionsInfoGetByDate(selectedDate)
      .then(resoult => {

        this.localServise.SetSessionsInfoGetByDate(selectedDate, resoult);
        this.EmitBackEndName("WEB");
        this.EmitLoginName(this.webServise.userData.userName);
        return resoult;
      })
      .catch(error => {
        let statusError = this.RoutGetStatusError(error);
        if (this.IsInternalError(statusError)) {
          throw error
        }
        else {
          this.EmitBackEndName("1C");
          this.EmitLoginName(this.localServise.getLocalUserName());
          return this.localServise.SessionsInfoGetByDate(selectedDate);
        }
      });
  }

  RoutGetHallInfo(): Promise<IHallInfo> | null {
    if (this.currentBackEndName == "1C") {
      return this.RoutLoggInByLocal().then(res => {
        return this.GetHallInfo();
      }).catch(err => {
        return this.GetHallInfo();
      }
      );
    }
    else {
      return this.GetHallInfo()
    }
  }

  private GetHallInfo(): Promise<IHallInfo> | null {
    return this.webServise.GetHallInfo().then(resoult => {
      /// web вернул актуальный статус загоним его 1С
      /// теоритически может возникнуть ситуация что вернулась связь 
      /// и со старым токеном прошел запрос при отображенном состоянии
      /// EmitBackEndName("1C") Не меняем его - пусть перелогинятся так надежнее
      console.log('GetHallInfo',resoult);
      this.localServise.SetHallInfo(resoult);
      this.EmitBackEndName("WEB");
      this.EmitLoginName(this.webServise.userData.userName);
      return resoult;

    })
      .catch(error => {
        console.log('error in rout servise', error)
        let statusError = this.RoutGetStatusError(error);

        if (this.IsInternalError(statusError)) {
          ///// сайт на связи вернул ошибку т.е. это реальная ошибка
          ////  тут придумать лог/сообщение ахтунг
          throw error
        }
        else {
          ////// неизвестно что думаем сайт не на связи ставим в буфер 1С
          /// отображаем что  работаем с 1С
          this.EmitBackEndName("1C");
          this.EmitLoginName(this.localServise.getLocalUserName());
          return this.localServise.GetHallInfo();
        }
      });
  }

  RoutStartHubbHallConnection() {
    this.webServise.StartHubbHallConnection();
    this.localServise.StartHubbHallConnection();
  }

  RoutStopHubbHallConnection() {
    this.webServise.StopHubbHallConnection();
    this.localServise.StopHubbHallConnection();
  }

  RoutHubbHallReconnect() {
    this.webServise.HubbHallReconnect();    
  }

  RoutOnHubbHallConnection() {
    this.webServise.OnHubbHallConnection();
    this.localServise.OnHubbHallConnection();
  }

  RoutOfHubbHallConnection() {
    this.webServise.OfHubbHallConnection();
    this.localServise.OfHubbHallConnection();
  }

  RoutDecrypt(encryptedData): string {
    return this.webServise.Decrypt(encryptedData);
  }

  RoutEncrypt(decryptedData): string {
    return this.webServise.Encrypt(decryptedData);
  }

  async RoutSetCassOperation(request : ISyncTicketsRequestViewModel){
      this.localServise.SetCassOperation(request).catch(err =>{throw err})
      await this.delay(200);
   }
   
  RoutCancelTickets(TicketsToCancel: ICancelTicketRequestViewModel) {
    if (this.currentBackEndName == "1C") {
      return this.RoutLoggInByLocal().then(res => {
        return this.CancelTickets(TicketsToCancel);
      }).catch(
        res => {
          return this.CancelTickets(TicketsToCancel);
        }
      );
    }
    else {
      return this.CancelTickets(TicketsToCancel);
    }
  }

  private CancelTickets(TicketsToCancel: ICancelTicketRequestViewModel) {
    return this.webServise.CancelTickets(TicketsToCancel)
      .then(resoult => {
        /// метод почемуто не возвращает состояние зала как другие 
        /// придется вызывать апдате холл при чем из компоента чтоб перерисовало
        this.EmitBackEndName("WEB");
        this.EmitLoginName(this.webServise.userData.userName);
        return resoult;
      })
      .catch(error => {
        //console.log('error in rout servise',error)
        
        let statusError = this.RoutGetStatusError(error);
        if (this.IsInternalError(statusError)) {
          return statusError
        }
        else {
          this.EmitBackEndName("1C");
          this.EmitLoginName(this.localServise.getLocalUserName());
          this.localServise.CancelTickets(TicketsToCancel)
            .then(resoult => {
              return resoult
            })
        }
      })
  }

  RoutSyncTickets(currentState: ISyncTicketsRequestViewModel, inReservePaymentBufer?: IdataObject): Promise<ISyncTicketsResponseViewModelInternal> | null {
    if (this.currentBackEndName == "1C") {
      return this.RoutLoggInByLocal().then(res => {
        return this.SyncTickets(currentState);
      }).catch(res => {
        return this.SyncTickets(currentState);
      });
    }
    else {
      return this.SyncTickets(currentState);
    }
  }

  private SyncTickets(currentState: ISyncTicketsRequestViewModel): Promise<ISyncTicketsResponseViewModelInternal> | null {
    // this.LogginCheck();
    const CurrentStateCopy : ISyncTicketsRequestViewModel = {...currentState}; 
    CurrentStateCopy.hallState=[];
    currentState.hallState.forEach(el=> {CurrentStateCopy.hallState.push(el)});
    const CurrentStateCopyString : string  = JSON.stringify(CurrentStateCopy);
    this.SetLoggMessageMetod("SyncTickets",[{name:"CurrentStateCopy",body:{value:CurrentStateCopyString} }]);
    //[{name:"CurrentStateCopy",bod{"CurrentStateCopy":JSON.stringify(CurrentStateCopy)}}];

    return this.webServise.SyncTickets(currentState)
      .then(resoult => {
        //console.log('ok in rout servise',resoult)
        let buferData = [];
        this.SetLoggMessageMetod("SyncTicketsThen",[{name:"CurrentStateCopy",body:{value:CurrentStateCopyString} }]);    
        this.localServise.SetHallState(JSON.parse(CurrentStateCopyString), resoult, buferData);
        this.EmitBackEndName("WEB");
        this.EmitLoginName(this.webServise.userData.userName);
        return resoult;
      })
      .catch(error => {
        
        let statusError = this.RoutGetStatusError(error);

        if (this.IsInternalError(statusError)) {
          //// сайт на связи вернул ошибку т.е. это реальная ошибка
          //// тут придумать лог/сообщение ахтунг
          //// здесь у нас все равно есть состояние зала 
          //// его можно запомнить в 1С и \ или отобразить 
          let errorHallState = undefined;
          if (typeof error.error != 'undefined') {
            if(typeof error.error.hallState != 'undefined'){
              errorHallState = error.error.hallState;  
            }
          } 
          
          if (errorHallState != undefined) {
            console.log(' hallState in rout error ', errorHallState);
            //let buferData = [];
            this.localServise.SetHallState(CurrentStateCopy, errorHallState);
          }
          throw error
        }
        else {
          this.EmitBackEndName("1C");
          this.EmitLoginName(this.localServise.getLocalUserName());
          return this.localServise.SyncTickets(currentState)
        }
      });
  }

  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async ExecuteElementQueue(queueElement: IdataObject) {
    let pause = await this.delay(500);
    if (queueElement.toDo == 'SyncTickets') {
      this.webServise.SyncTickets(queueElement.parametr)
        .then(res => {
          let elementsToClear = { keys: [] };
          elementsToClear.keys.push(queueElement.key);
          this.localServise.ClearBuffer(elementsToClear);
        })
        .catch(err => {
          throw err
        });
    }
    else if (queueElement.toDo == 'CancelTickets') {
      this.webServise.CancelTickets(queueElement.parametr)
        .then(res => {
          let elementsToClear = { keys: [] };
          elementsToClear.keys.push(queueElement.key);
          this.localServise.ClearBuffer(elementsToClear);
        })
        .catch(err => {
          throw err;
        });
    }
  }

  private async ExecuteQueue(resoult: IDataFrom1C) {
    let queue = resoult.data.queue;
    for (let index = 0; index < queue.length; index++) {
      let queueElement = queue[index];
      await this.ExecuteElementQueue(queueElement);
    }
  };

  async RoutExecuteBufer() {
    if(this.currentBackEndName == "1C") {
      return
    }
    
    return await this.localServise.GetBuffer()
      .then(resoult => this.ExecuteQueue(resoult))
      .catch(err => { throw err });
  }

  async RoutSyncWebTo1C(idHall, ticketOperation, itemDay: Date) {
    if (this.currentBackEndName == "1C") {
      return
    }

    let functionError = false;

    let sessionData: ISessionData
    await this.webServise.SessionsInfoGetByDate(itemDay.toISOString())
      .then(resoult => { sessionData = resoult; })
      .catch(err => { functionError = true });

    if (functionError){
      throw 'SessionsInfoGetByDate';
    }  

    let currentMovies = sessionData.movieInfo;
    // let uniqMoviesID = _.uniq(sessionData.sessionInfo, true, session => { return session.idMovie });
    // uniqMoviesID.forEach(
    //   ID => {
    //     let found = sessionData
    //       .movieInfo
    //       .find(function (element) { return element.id == ID.idMovie; });

    //     currentMovies.push(found)
    //   });

    this.localServise.SetSessionsInfoGetByDate(itemDay.toISOString(), sessionData)
                     .catch(err => {functionError = true});
    await this.delay(300);

    if (functionError){
      throw 'SetSessionsInfoGetByDate';
    }  

    for (let indexMovie = 0; indexMovie < currentMovies.length; indexMovie++) {
      let currentMovie = currentMovies[indexMovie];
      let movieSesions = _.filter(sessionData.sessionInfo, element => { return element.movie.id == currentMovie.id && element.isVisible });
      for (let indexSession = 0; indexSession < movieSesions.length; indexSession++) {
        let currentSession = movieSesions[indexSession];

        let request: ISyncTicketsRequestViewModel = {
          idHall: idHall,
          starts: currentSession.starts, //"yyyy-MM-dd HH:mm:ss",		
          blockSeats: [],
          hallState: [],
          ticketOperation: ticketOperation
        };
        await this.RoutSyncTickets(request).catch(err=>{functionError = true});
       
        if (functionError){
          throw 'RoutSyncTickets error';
        }  
    
      }
    }
  }

  
  RoutGetBufferSize() {
    return this.localServise.GetBufferSize()
  }

  RoutConvertTicketStatusToChairStatus(status) {
    return this.webServise.ConvertTicketStatusToChairStatus(status)

  }

  RoutPrintBy1C(data: IdataObject) {
    let data1C = JSON.stringify({ point: 'PrintTickets', data: data });
    let myPromise = this.localServise.PrintTicets(data1C);
    return myPromise;
  }

  SetGlobalParametrs(parametrs: IdataObject) {
    this.webServise.BASE_URL = parametrs.BASE_URL;
    this.webServise.HALL_ID = parametrs.HALL_ID;
    this.webServise.PACKAGE_MOVIES_SIZE = parametrs.PACKAGE_MOVIES_SIZE;
    this.webServise.CRYPTO_KEY = parametrs.CRYPTO_KEY;
    this.webServise.CRYPTO_IV = parametrs.CRYPTO_IV;
    this.webServise.CASH_DESK_ID = parametrs.CASH_DESK_ID;
    this.webServise.WEB_SERVISE_BLOCED = parametrs.WEB_SERVISE_BLOCED;
    this.localServise.LOCAL_SERVISE_BLOCED = parametrs.LOCAL_SERVISE_BLOCED;
    this.localServise.webUserName = parametrs.LOGIN;
    this.localServise.webPassword = parametrs.PASSWORD;
    this.localServise.localeUserName = parametrs.USER;
    this.localServise.RESPONSE_TIME_OUT = +parametrs.RESPONSE_TIME_OUT;
    this.localServise.RESPONSE_WAIT_STEP = +parametrs.RESPONSE_WAIT_STEP;
    this.localServise.RESERVE_PRICE = +parametrs.RESERVE_PRICE;
    this.localServise.logOperator.LOGG_ON   = parametrs.LOGG_ON;
    this.localServise.SMS_LOGIN = parametrs.SMS_LOGIN;
    this.localServise.SMS_PASSWORD = parametrs.SMS_PASSWORD;
    this.smsSevise.SMS_LOGIN = parametrs.SMS_LOGIN;
    this.smsSevise.SMS_PASSWORD = parametrs.SMS_PASSWORD;
    this.permissionServise.userPermissions = JSON.parse(parametrs.PERMISSIONS) ;

  }

  RoutGetParametrs() {
    return {
      BASE_URL: this.webServise.BASE_URL,
      HALL_ID: this.webServise.HALL_ID,
      PACKAGE_MOVIES_SIZE: this.webServise.PACKAGE_MOVIES_SIZE,
      CRYPTO_KEY: this.webServise.CRYPTO_KEY,
      CRYPTO_IV: this.webServise.CRYPTO_IV,
      CASH_DESK_ID: this.webServise.CASH_DESK_ID,
      WEB_SERVISE_BLOCED: this.webServise.WEB_SERVISE_BLOCED,
      LOCAL_SERVISE_BLOCED: this.localServise.LOCAL_SERVISE_BLOCED,
      webUserName: this.localServise.webUserName,
      webPassword: this.localServise.webPassword,
      localeUserName: this.localServise.localeUserName,
      RESPONSE_TIME_OUT: this.localServise.RESPONSE_TIME_OUT,
      RESPONSE_WAIT_STEP: this.localServise.RESPONSE_WAIT_STEP,
      RESERVE_PRICE: this.localServise.RESERVE_PRICE,
      
    }
  }

  // точка входа от 1С старт из js
  RoutOn1CDataIncome(data: string) {
    this.localServise.On1CDataIncome(data);
  }

  // точка входа от 1С старт из 1С
  RoutInit1CDataIncome(StringDataFrom1C: string) {
    let DataFrom1C = JSON.parse(StringDataFrom1C);
    switch (DataFrom1C.point) {
      case 'SetGlobalParametrs':
        this.SetGlobalParametrs(DataFrom1C.data);
    }
  }

  RoutGetStatusError(error){
    let statusError = 0; // undefined считается что сервер на связи
    
    if (typeof error.status != 'undefined'){
      // все ошибки считаем undefined т.е сервер 
      statusError = error.status;
      
    } else if(Object.getOwnPropertyNames(error).find(e=>e=="name")) {
      if(error.name = 'TimeoutError')
      statusError = 101; 
    }
    
    if(typeof statusError == 'string' && statusError != "406") {
      statusError = 0;
    } else if(statusError != 406 ) {
      statusError = 0
    }

    return statusError;
  } 
 
  /// написать функцию сохранения куска лога пока в 1С очевидно
  RoutSaveLogg() {
    this.localServise.SaveLogg();
  }
  
  RoutSetLoggMessage(logMessage: IloggObject){
    this.localServise.SetLoggMessage(logMessage);
  }

  SetLoggMessageButtonPress(buttonName : string) {
    let logMessage: IloggObject = {
      message_date : new Date(),
      message_type : LoggMessageTypes.Interface,
      message_name : buttonName,
      message_parametr : []
    }
    this.RoutSetLoggMessage(logMessage)
  }

  SetLoggMessageMetod(metodName : string, metodParams : Array<IloggParametr>) {
    let logMessage: IloggObject = {
      message_date : new Date(),
      message_type : LoggMessageTypes.Metod,
      message_name : metodName,
      message_parametr : metodParams
    }
    this.RoutSetLoggMessage(logMessage)
  }

  RoutTakeLoggFiles(takeLogFiles,skipLogFiles){
    this.localServise.TakeLoggFiles(takeLogFiles,skipLogFiles);
  }

  RoutChangeLoggStatus(loggStatus : boolean) {
    this.localServise.logOperator.LOGG_ON  = loggStatus;
  }

  RoutStopAutoSaveLogg() {
    this.localServise.logOperator.AVTO_SAVE = false;
  }

  RoutStartAutoSaveLogg() {
    this.localServise.logOperator.AVTO_SAVE = true;
  }

  RoutShopSale() {
    const order = this.shopServise.GetOrderSnapshot();
    this.localServise.ShopSale(order).then((res)=>this.shopServise.ClearOrder());
  }

  async RoutSendSMS(smsContent: string , recipient : string ) {
    this.localServise.SendSMS(smsContent, recipient);
    await this.delay(300);
  }


}


/////// Оставлено если потом восстановить нужно будет
///// не работает задержка  -- async () => {await this.delay(500)}; --- 
///// пауза не генериться почемуто 
// function RoutExecuteBufer_() {
//   this.localServise.GetBuffer()
//     .then(resoult => {
//       let queue = resoult.data.queue;
//       queue.forEach(queueElement => {
//         async () => { await this.delay(500) };
//         alert('pause hand made');
//         if (queueElement.toDo == 'SyncTickets') {
//           this.webServise.SyncTickets(queueElement.parametr)
//             .then(res => {
//               let elementsToClear = { keys: [] };
//               elementsToClear.keys.push(queueElement.key);
//               this.localServise.ClearBuffer(elementsToClear);
//             })
//             .catch(err => {
//               throw err
//             });
//         }
//         else if (queueElement.toDo == 'CancelTickets') {
//           this.webServise.CancelTickets(queueElement.parametr)
//             .then(res => {
//               let elementsToClear = { keys: [] };
//               elementsToClear.keys.push(queueElement.key);
//               this.localServise.ClearBuffer(elementsToClear);
//             })
//             .catch(err => {
//               throw err;
//             });
//         }
//       });
//     })
//     .catch(err => { throw err });
// }


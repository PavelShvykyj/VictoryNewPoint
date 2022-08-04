
import { Injectable } from '@angular/core';
import {  IbackEnd, 
          ILoggInData,
          IChairStatus,
          IChairsStatusInSessionInfo,
          IResponseData,
          IChairStateViewModel,
          IChairStateViewModelInternal,
          ISyncTicketsResponseViewModelInternal,
          ISyncTicketsResponseViewModel,
          ISyncTicketsRequestViewModel,
          ICancelTicketRequestViewModel,
          IGetMovieResponseViewModel,
          IGetSessionResponseViewModel,
          ISessionData,
          IHallInfo } from '../iback-end'
import { LoggMessageTypes } from '../global_enums'
import { LoggOperatorService } from '../logg/logg-operator.service';
import { IloggObject, IloggParametr } from '../ilogg';
import { IdataObject } from '../HallBrowser/idata-object';
import { HttpHeaders, HttpClient } from '@angular/common/http';


/// <reference types="crypto-js" />
import * as CryptoJS from 'crypto-js';
import * as _ from 'underscore';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr'
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';



@Injectable()
export class RequestManagerService implements IbackEnd {
  
  BASE_URL = "https://kino-scala.com.ua/api/1.0"//"https://kino-peremoga.com.ua/api/1.0";
  HALL_ID  = 1;
  PACKAGE_MOVIES_SIZE = 80;
  CRYPTO_KEY = 'xm5POGDda6o1SiZMfuNSvXbV8r0+uyBF7BMdAYh+f5Q=';
  CRYPTO_IV  = 'TweTnUNAAL8VMtvtMNj0Vg==';
  CASH_DESK_ID = 1;
  WEB_SERVISE_BLOCED = false;
  SHORT_REQUEST_TIMEOUT = '5000';

  private _userData : ILoggInData;
  private _refreshLoginTimer : number;
  private _token : string; 
  private _hubHallConnection : HubConnection;
  private _changeHallState = new Subject<IChairsStatusInSessionInfo>();
  changeHallState$ : Observable<IChairsStatusInSessionInfo> = this._changeHallState.asObservable(); 

  private signalRCloseExpected : boolean = false;

  constructor(private http : HttpClient, private logOperator: LoggOperatorService) { 
    this._hubHallConnection = new HubConnectionBuilder().withUrl('https://kino-scala.com.ua/hallHub').build();   //'https://kino-peremoga.com.ua/hallHub'
    this._hubHallConnection.serverTimeoutInMilliseconds = 60*60*1000; // час - это с запасом жизнь токега - пол часа с токеном делаем реконнект
    this._hubHallConnection.onclose(error=>{
      //alert('signal error'+error.message)
      console.log('signal error',error);
      if (!this.signalRCloseExpected) {
        setTimeout(()=>{this.HubbHallReconnect()},200);
        
      }
    });
  }

  SetLoggMessage(logMessage: IloggObject) {
    this.logOperator.SetLoggMessage(logMessage);
  }

  ConvertTicketStatusToChairStatus(intStatus : number ) : IChairStatus {
    //let binStatus = intStatus.toString(2);
    // побитовое И + побитовый сдвиг 
    // логика вычислений binStatus = 0000 0000 0000 0000 - 16бит 
    // Біт 16-13:	Ініціатор: 0 - веб, 1-15 - номер каси. 
    // Біт 12-5:	idTicketCategory - катагорія квитка (максімум 255 категорій)
    // Біт 4-3:	завжди 0 (зарезервовано)
    // Біт 2:	блокування: якщо 1 - початий процес продажу або бронювання (місце заблоковано)
    // Біт 1:	операція: 1 - продажа, 0 - бронювання
    let chairStatus : IChairStatus = {
      iniciator : (intStatus & 0b1111000000000000) >> 12,
      idTicketCategory : (intStatus & 0b0000111111110000) >> 4,
      inReserving : (intStatus & 0b0000000000000010) == 2,
      isSoled : ((intStatus & 1) == 1) && ((intStatus & 0b0000000000000010) != 2),
      isReserved : ((intStatus & 1) != 1) && ((intStatus & 0b0000000000000010) != 2),
      isFree : false,
      isSelected : false,
    }
    return chairStatus
  }

  ConvertChairStatusToTicketStatus(ChairStatus : IChairStatus) : number {
    //var result = 0;
    //result = result | ((status.IdCashDesk & 0b1111) << 12);
    //result = result | ((status.IdTicketCategory & 0b11111111) << 4);
    //if (status.BuyOrReserveStarted) result = result | 2;
    //if (status.TicketOperation == TicketOperation.Buy) result = result | 1;
    //return result;
    //console.log(ChairStatus);
    let result = 0;
    result = result | ((this.CASH_DESK_ID & 0b1111) << 12); 
    result = result | ((ChairStatus.idTicketCategory & 0b11111111) << 4);
    if (ChairStatus.inReserving) {
      result = result | 2;
    }
    
    if (ChairStatus.isSoled ) {
      result = result | 1;
    }
    return result
  }

  ConvertHallStateInternalToHallState(HallStateInternal : Array<IChairStateViewModelInternal>) : Array<IChairStateViewModel>{
    let hallState = [];
    HallStateInternal.forEach(element => {
      let secretCode = element.t;
      if (element.t) {
        secretCode = this.Encrypt(element.t)
      }
      
      let chairState : IChairStateViewModel = {
      c : element.c,
      p : element.p,
      t : secretCode,
      s : this.ConvertChairStatusToTicketStatus(element.s)};
      hallState.push(chairState);
    });
    return hallState
  }

  ConvertHallStateToHallStateInternal(HallState : Array<IChairStateViewModel>) : Array<IChairStateViewModelInternal>{
  let hallState = [];
  HallState.forEach(element => {
    
    if (element.t) {
      element.t = this.Decrypt(element.t)
      console.log('t in web convert ',element.t); 
    }
   
     
    let chairState : IChairStateViewModelInternal = {
    c : element.c,
    p : element.p,
    t : element.t,
    s : this.ConvertTicketStatusToChairStatus(element.s)};
    hallState.push(chairState);
  });
  return hallState
  }

  ConvertSisionDataInternalToSisionData (SessionData : IdataObject) : ISyncTicketsResponseViewModel {
  let sessionData : ISyncTicketsResponseViewModel = {
    starts : SessionData.starts,
    hallState : this.ConvertHallStateInternalToHallState(SessionData.hallState)
  };
  //SessionData.hallState.forEach(element => {
  //  let chairState : IChairStateViewModel = {
  //  c : element.c,
  //  p : element.p,
  //  t : element.t,
  //  s : this.ConvertChairStatusToTicketStatus(element.s)};
  //  sessionData.hallState.push(chairState);
  //});
  return sessionData;
  } 

  ConvertSisionDataToSisionDataInternal (SessionData : IdataObject ) : ISyncTicketsResponseViewModelInternal {
    let sessionDataInternal : ISyncTicketsResponseViewModelInternal = {
      starts : SessionData.starts,
      hallState : []
    };
    SessionData.hallState.forEach(element => {
      if (element.t) {
        element.t = this.Decrypt(element.t)
        console.log('t in web convert session ',element.t);
      }
      
      let chairStateInternal : IChairStateViewModelInternal = {
      c : element.c,
      p : element.p,
      t : element.t,
      s : this.ConvertTicketStatusToChairStatus(element.s)};
      sessionDataInternal.hallState.push(chairStateInternal);
    });
    console.log('in convert session ', sessionDataInternal)
    return sessionDataInternal;
  }

  HubbHallStateParse(encryptedIdSesion : string, SessionData : ISyncTicketsResponseViewModel) {
    if(!encryptedIdSesion || !SessionData) {
      console.log('error  HubbHallStateParse не заполнены параметры')
      return
    }

    let idSesion = this.Decrypt(encryptedIdSesion);
    let sessionDataInternal : ISyncTicketsResponseViewModelInternal = this.ConvertSisionDataToSisionDataInternal(SessionData) 
    let hubSessionInfo = {id : parseInt(idSesion) , chairsData : sessionDataInternal};
    this._changeHallState.next(hubSessionInfo);
    
  }

  StartHubbHallConnection()  {  
    if (this.WEB_SERVISE_BLOCED){
      return;
    }

    return this._hubHallConnection.start();//.catch(error => {console.log('start error',error)});   
  }

  StopHubbHallConnection() {
    if (this.WEB_SERVISE_BLOCED){
      return;
    }

    return this._hubHallConnection.stop();//.catch(error => {console.log(error)});
  }

  OnHubbHallConnection(){
    if (this.WEB_SERVISE_BLOCED){
      return;
    }

    this._hubHallConnection.on("ReceiveHallState",(idSession, hallstate) =>{
                                                    this.HubbHallStateParse(idSession, hallstate)}
     ) 
    }

  OfHubbHallConnection(){
    if (this.WEB_SERVISE_BLOCED){
      return;
    }

    this._hubHallConnection.off("ReceiveHallState");
  }

  HubbHallReconnect(){
    if (this.WEB_SERVISE_BLOCED){
      return;
    }
    console.log('start HubbHallReconnect');
    this.signalRCloseExpected = true;
    this.OfHubbHallConnection();
    this._hubHallConnection.stop()
                           .then(resoult =>{
                            console.log('suscs stop in reconnect'); 
                            this.signalRCloseExpected = false;
                            this._hubHallConnection.start()
                                                    .then(res=>{
                                                      console.log('suscs start after stop in reconnect'); 
                                                      this.OnHubbHallConnection()})
                                                    .catch(error=> {
                                                      console.log('signal start err', error)})
                                                    
                                                    
                                                    
                                                    })
                           .catch(error=> { 
                             console.log('signal stop err', error)
                             this.signalRCloseExpected = false;
                             this._hubHallConnection.start()
                                                    .then(res=>{
                                                      console.log('suscs start after error stop in reconnect'); 
                                                      this.OnHubbHallConnection()})
                                                    .catch(error=> {
                                                      console.log('signal start in cach err', error)
                                                    }) 
                            });  
 }

  RefreshToken() {
    if (this.WEB_SERVISE_BLOCED){
      return;
    }

    setTimeout(() => {
              this.LoggInByPass(this._userData)
                  .then(resoult => {
                    console.log('refresh token');  
                    this.HubbHallReconnect()
                    //this.RefreshToken(); // rekursive     
                  })
                  .catch(resoult => {
                    console.log('RefreshToken error',resoult)
                    //  somthing wrong что то не так при обновлении токена что будем делать пока не ясно
                    //  токен почищен в  LoggInByPass данные пользователя в свойствах пока не чистим вдруг захотим переденуть
                  })
    }, this._refreshLoginTimer);
  }

  Decrypt(encryptedData) : string {
    
    encryptedData = encryptedData.replace(RegExp("~",'g'),"=")
                                 .replace(RegExp("-",'g'),"+")
                                 .replace(RegExp(/\|/ ,'g'),"/");
    
    let key = CryptoJS.enc.Base64.parse(this.CRYPTO_KEY);
    let iv = CryptoJS.enc.Base64.parse(this.CRYPTO_IV);
    let decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC});
  
    let  decryptedData = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedData;
  }

  Encrypt(decryptedData : string) : string  {
    
    
    let key = CryptoJS.enc.Base64.parse(this.CRYPTO_KEY);
    let iv = CryptoJS.enc.Base64.parse(this.CRYPTO_IV);
    //console.log(decryptedData);
    let encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(decryptedData), key,
        {
            iv: iv,
            mode: CryptoJS.mode.CBC
        });
    //console.log('ciphertext', encrypted.ciphertext);
    //console.log('toString', encrypted.toString());
    let encryptedString = encrypted.toString()    
                                   .replace(RegExp("=",'g'),"~")
                                   .replace(RegExp(/\+/,'g'),"-")
                                   .replace(RegExp(/\// ,'g'),"|");
    //console.log('replace', encryptedString);                               
    return  encryptedString;                                
  }

  // TestCrypt()
  // {
  //   var key = CryptoJS.enc.Utf8.parse('7061737323313233');
  //   var iv = CryptoJS.enc.Utf8.parse('7061737323313233');
  //   var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse("It works"), key,
  //       {
  //           keySize: 128 / 8,
  //           iv: iv,
  //           mode: CryptoJS.mode.CBC,
  //           padding: CryptoJS.pad.Pkcs7
  //       });

  //   var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
  //       keySize: 128 / 8,
  //       iv: iv,
  //       mode: CryptoJS.mode.CBC,
  //       padding: CryptoJS.pad.Pkcs7
  //   });

  //   console.log('Encrypted :' + encrypted);
  //   console.log('Key :' + encrypted.key);
  //   console.log('Salt :' + encrypted.salt);
  //   console.log('iv :' + encrypted.iv);
  //   console.log('Decrypted : ' + decrypted);
  //   console.log('utf8 = ' + decrypted.toString(CryptoJS.enc.Utf8));
  // }

  get userData(){
    return this._userData;
  }  

  getUserData() : ILoggInData {
    return {userName : "Atlantica", password : "" }
  }

  LoggInByPass(userData : ILoggInData) : Promise<IResponseData>  {

    if (this.WEB_SERVISE_BLOCED){
      let myPromise : Promise<IResponseData>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }


    this._token = "";
    let headers = new HttpHeaders().append('Authorization','none').append('Content-Type','text/json').append('timeout',this.SHORT_REQUEST_TIMEOUT)
    let connection = this.BASE_URL+"/account/login";
    
    
     return this.http.post(connection,
                          userData,
                          {headers:headers,
                          observe: 'body',
                          withCredentials:false,
                          reportProgress:true,
                          responseType:'text'})
                      .toPromise()
                      .then(response => { let objResponse = JSON.parse(response);
                            let resoult : IResponseData = {
                            status : '200',
                            statusText : 'Ok',
                            token : objResponse.jwtToken,
                            expired : objResponse.expiryMinutes}
                            this._token = resoult.token;
                            //sessionStorage.setItem('token',resoult.token)
                            this._userData = userData;
                            //console.log('token life ',+(objResponse.expiryMinutes)-1);
                            
                            this._refreshLoginTimer = (+(objResponse.expiryMinutes)-1)*60*1000;
                            this.RefreshToken();
                            
                            return resoult;
                    
                       })
                      .catch(error => {
                        let resoult : IResponseData = 
                        {
                        status : error.status,
                        statusText : error.statusText,
                        token : 'badToken',
                        expired : 0
                        }
                        throw error;
                        //return resoult;

                      }); // конвертируем response в строку. Дешифруем?
  }

  GetMovieByID(idMovie) {
    if (this.WEB_SERVISE_BLOCED){
      let myPromise : Promise<IResponseData>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }



    let headers = new HttpHeaders().append('Authorization','Bearer '+this._token).append('Content-Type','text/json').append('timeout',this.SHORT_REQUEST_TIMEOUT)
    let connection = this.BASE_URL+"/movies/get/"+idMovie;
    return this.http.get(connection,
                        {headers:headers,
                        observe: 'body',
                        withCredentials:false,
                        reportProgress:true,
                        responseType:'text'})   

  } 

  GetPakegMoviesById(){
    if (this.WEB_SERVISE_BLOCED){
      let myPromise : Promise<IResponseData>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }

    let headers = new HttpHeaders().append('Authorization','Bearer '+this._token).append('Content-Type','text/json').append('timeout',this.SHORT_REQUEST_TIMEOUT)
    let connection = this.BASE_URL+"/movies/getall/0/"+this.PACKAGE_MOVIES_SIZE.toString();  
    return this.http.get(connection,
                        {headers:headers,
                        observe: 'body',
                        withCredentials:false,
                        reportProgress:true,
                        responseType:'text'})
                     .toPromise()
                     .then(reoult =>{return JSON.stringify({movieInfo : JSON.parse(reoult)})})
                     .catch(error=>{return error});   
  }

  GetCategoryTickets(){
    
    if (this.WEB_SERVISE_BLOCED){
      let myPromise : Promise<IResponseData>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }

    // /ticketcategories/getall
    let headers = new HttpHeaders().append('Authorization','Bearer '+this._token).append('Content-Type','text/json').append('timeout',this.SHORT_REQUEST_TIMEOUT)
    let connection = this.BASE_URL+"/ticketcategories/getall";  
    return this.http.get(connection,
                        {headers:headers,
                        observe: 'body',
                        withCredentials:false,
                        reportProgress:true,
                        responseType:'text'})
                     .toPromise()
                     .then(reoult =>{return JSON.stringify({categoryTicketsInfo : JSON.parse(reoult)})})
                     .catch(error=>{throw error});   


  }

  GetCategorySeats(){
    
    if (this.WEB_SERVISE_BLOCED){
      let myPromise : Promise<IResponseData>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }


    // /ticketcategories/getall
    let headers = new HttpHeaders().append('Authorization','Bearer '+this._token).append('Content-Type','text/json').append('timeout',this.SHORT_REQUEST_TIMEOUT)
    let connection = this.BASE_URL+"/seatcategories/getall";  
    return this.http.get(connection,
                        {headers:headers,
                        observe: 'body',
                        withCredentials:false,
                        reportProgress:true,
                        responseType:'text'})
                     .toPromise()
                     .then(reoult =>{ return JSON.stringify({categorySeatsInfo : JSON.parse(reoult)})})
                     .catch(error=>{throw error});   


  }

  GetChairsCateoryInfo(){
    
    if (this.WEB_SERVISE_BLOCED){
      let myPromise : Promise<IResponseData>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }

    
    // /ticketcategories/getall
    let headers = new HttpHeaders().append('Authorization','Bearer '+this._token).append('Content-Type','text/json').append('timeout',this.SHORT_REQUEST_TIMEOUT)
    let connection = this.BASE_URL+"/hall/get/"+this.HALL_ID;  
    return this.http.get(connection,
                        {headers:headers,
                        observe: 'body',
                        withCredentials:false,
                        reportProgress:true,
                        responseType:'text'})
                     .toPromise()
                     .then(reoult =>{return JSON.stringify({chairsCateoryInfo : JSON.parse(reoult)})})
                     .catch(error=>{throw error});   


  }

  SetBodySyncTicketsLogMessage(blockSeats, hallState, typeMessage : LoggMessageTypes){
    let body : Array<IloggParametr> = [];
    body.push({name : 'blockSeats', body : {data :  JSON.stringify(blockSeats)}  });
    body.push({name : 'hallState', body :  {data :  JSON.stringify(hallState)}});
    
    let message : IloggObject = {
      message_type  : typeMessage,
      message_name  : 'SyncTickets',
      message_parametr : body,
      message_date :  new Date()
    }
    this.SetLoggMessage(message);
  }
  
  SyncTickets(currentState :  ISyncTicketsRequestViewModel) : Promise<ISyncTicketsResponseViewModelInternal> | null
  { 
    if (this.WEB_SERVISE_BLOCED){
      let myPromise : Promise<ISyncTicketsResponseViewModelInternal>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }
    
    let getStackTrace = function() {
      //let obj:IdataObject = {};
      let err = new Error();
      return err.stack
      //return obj.stack;
    };
    
    let message : IloggObject = {
      message_type  : LoggMessageTypes.Metod,
      message_name  : 'SyncTicketsTrase',
      message_parametr : [{name : 'SyncTicketsTrase' ,body : {data :  getStackTrace()}  }],
      message_date :  new Date()
    }
    this.SetLoggMessage(message);

    //console.log('getStackTrace',getStackTrace());
    
    
    let headers = new HttpHeaders().append('Authorization','Bearer '+this._token).append('Content-Type','text/json')
    let connection = this.BASE_URL+"/tickets/sync";  
    this.SetBodySyncTicketsLogMessage(currentState.blockSeats,currentState.hallState,LoggMessageTypes.RequestBody);
    let postBody = {
                    idHall: this.HALL_ID,
                    starts: currentState.starts, 
                    blockSeats: this.ConvertHallStateInternalToHallState(currentState.blockSeats),
                    hallState: this.ConvertHallStateInternalToHallState(currentState.hallState)
                   };
    return this.http.post(connection,
                  postBody,
                  {
                    headers:headers,
                    observe: 'body',
                    withCredentials:false,
                    reportProgress:true,
                    responseType:'json'
                  })
                  .toPromise()
                  .then(response =>
                    {
                      console.log('ok in web serveice',response);
                      let resoult : ISyncTicketsResponseViewModelInternal  =  this.ConvertSisionDataToSisionDataInternal(response);
                      
                      
                      // currentState.hallState.forEach(copyel=> {const reselement = resoult.hallState.find(el => el.c.c==copyel.c.r && el.c.c==copyel.c.r);
                      //   let newel = {...reselement}; 
                      //   if (copyel.s.iniciatorFirst) {
                      //     newel.s.reserveFirst = copyel.s.reserveFirst;  newel.s.iniciatorFirst = copyel.s.iniciatorFirst;   
                      //   }
                      //   return newel 
                      // })
                      
                      this.SetBodySyncTicketsLogMessage([],resoult.hallState,LoggMessageTypes.ResponseBody);
                      return resoult;
                    })
                  .catch(error => 
                    {
                      if (typeof error.error != 'undefined') {
                        if(typeof error.error.hallState != 'undefined'){
                          error.error.hallState = this.ConvertHallStateToHallStateInternal(error.error.hallState);  
                          this.SetBodySyncTicketsLogMessage([],error.error.hallState,LoggMessageTypes.ErrorResponseBody);  
                        }
                      } 
                      this.SetBodySyncTicketsLogMessage([],[],LoggMessageTypes.ErrorResponseBody);  
                      throw error
                    });
                 
  }


  SessionsGetByDate(selectedDate : string) : Promise<string>  {
    if (this.WEB_SERVISE_BLOCED){
      let myPromise : Promise<string>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }
    
    let headers = new HttpHeaders().append('Authorization','Bearer '+this._token).append('Content-Type','text/json').append('timeout',this.SHORT_REQUEST_TIMEOUT)
    let connection = this.BASE_URL+"/sessions/getbydatewithmovies";
   
    let postBody = {
      idHall: this.HALL_ID,
      starts: selectedDate
      }
      
    return this.http.post(connection,
                  postBody,
                  {headers:headers,
                  observe: 'body',
                  withCredentials:false,
                  reportProgress:true,
                  responseType:'text'})
                  .toPromise()
                  .then(reoult =>{return JSON.stringify({sessionInfo : JSON.parse(reoult)})})
                  .catch(error=>{throw error});
      
  }

  SessionsInfoGetByDate(selectedDate : string)  {
    
    if (this.WEB_SERVISE_BLOCED){
      let myPromise : Promise<IdataObject>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }

    let promiseCollection : Array<any> = [];
    promiseCollection.push(this.SessionsGetByDate(selectedDate));
    //promiseCollection.push(this.GetPakegMoviesById());
 
    return Promise.all(promiseCollection).then(resoult => {
                                          let sessiondata = JSON.parse(resoult[0]);
                                          // for (let i = 1; i <= resoult.length-1; i++) {
                                          //       let par = JSON.parse(resoult[i]);
                                          //       Object.assign(par_1,par);     
                                          //     }                                          
                                          
                                          let movies : Array<IGetMovieResponseViewModel> = []
                                          sessiondata.sessionInfo.forEach(session => {
                                            movies.push(session.movie);
                                          });

                                          let uniqMovies = _.uniq(movies,false,movie=>{return movie.id});

                                          Object.assign(sessiondata,{movieInfo : uniqMovies});
                                          return sessiondata})
                                         .catch(error => {throw error})   
  }

  GetHallInfo(){
    
    if (this.WEB_SERVISE_BLOCED){
      let myPromise : Promise<IdataObject>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }
    
    let promiseCollection : Array<any> = [];
    promiseCollection.push(this.GetCategorySeats());
    promiseCollection.push(this.GetCategoryTickets());
    promiseCollection.push(this.GetChairsCateoryInfo());

    return Promise.all(promiseCollection).then(resoult => {
                                          let par_1 = JSON.parse(resoult[0]);
                                          for (let i = 1; i <= resoult.length-1; i++) {
                                                let par = JSON.parse(resoult[i]);
                                                Object.assign(par_1,par);     
                                              }
                                          //console.log(par_1);  
                                          return par_1})
                                         .catch(error => {console.log('HallInfo error in web serveice',error); throw error})   


  }

  CancelTickets(TicketsToCancel : ICancelTicketRequestViewModel) : Promise<number>{
    
    if (this.WEB_SERVISE_BLOCED){
      let myPromise : Promise<number>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }
 
    let headers = new HttpHeaders().append('Authorization','Bearer '+this._token).append('Content-Type','text/json')
    let connection = this.BASE_URL+"/tickets/cancel";  
    let postBody = TicketsToCancel;
    
    
    console.log('URL',connection);
    console.log('body',JSON.stringify(TicketsToCancel));
    console.log('Authorization','Bearer '+this._token);


    return this.http.post(connection,
                  postBody,
                  {
                    headers:headers,
                    observe: 'response',
                    withCredentials:false,
                    reportProgress:true,
                    responseType:'json'
                  })
                  .toPromise()
                  .then(response =>
                    {
                      console.log('ok cancel in web serveice',response);
                      return response.status;
                    })
                  .catch(error => 
                    {
                      console.log('error cancel in web serveice',error);
                      throw error
                    });
  }

}

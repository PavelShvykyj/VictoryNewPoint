import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, tap, catchError } from 'rxjs/operators';
import { _throw } from 'rxjs/observable/throw';

import { LoggOperatorService } from '../logg/logg-operator.service';
import { IdataObject } from '../HallBrowser/idata-object';
import { IloggObject } from '../ilogg';
import { LoggMessageTypes } from '../global_enums'
import { IfObservable } from 'rxjs/observable/IfObservable';
import { from } from 'rxjs/observable/from';


@Injectable()
export class WebInterceptorService implements HttpInterceptor {

  DEFOULT_TIMEOUT: number = 15000;
  

  constructor(private logOperator: LoggOperatorService) { }

  private SetLoggMessage(req) {
    let loggMessage: IloggObject;
    if (req instanceof HttpResponse) {
      loggMessage = {
        message_date: new Date(),
        message_name: req.url,
        message_type: LoggMessageTypes.Response,
        message_parametr: [{ name: req.status.toString()}]
        // очень большой объем
        //message_parametr: [{ name: req.status.toString(), body: {ans : JSON.stringify(req.body) }  }]
      }
    } else if (req instanceof HttpRequest) {
      loggMessage = {
        message_date: new Date(),
        message_name: req.url,
        message_type: LoggMessageTypes.Request,
        message_parametr: [{ name: req.method, body: req.body }]
      } 
    } 
    else if (req instanceof HttpErrorResponse) {
      
      loggMessage = {
        message_date: new Date(),
        message_name: req.url,
        message_type: LoggMessageTypes.Request,
        message_parametr: [{ name: ` ${req.status}` , body: {err : req.error} }]}
    }
    else {
     let nameProp : string ;
     let message_name : string ;
      if(Object.getOwnPropertyNames(req).find(e=>e=="name")) {
        nameProp = req.name
        message_name = "101";
     } 
     else{
      message_name = "0";
      nameProp = 'unknown'
     }
      
      
      loggMessage = {
        message_date: new Date(),
        message_name:  message_name,
        message_type: LoggMessageTypes.Response,
        message_parametr: [{ name:  nameProp}]
    }
  }
  this.logOperator.SetLoggMessage(loggMessage);
}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // handle передает далее полученный (пойманный) запрос по цепочке перехватчиков возвращает Observable<HttpEvent<any>> 
    // pipe - метод объекта Observable возвращает функцию которая выполняет над потоком переданные в параметрах функции
    // мы используем оператор timeout который вызывает ошибку если не пришло ни одного сообщения в течении переденного вермени

      

    if(req instanceof HttpRequest) {
      this.SetLoggMessage(req) 
    }      
    

    let reqTimout = req.headers.get('timeout');
    let resoultTimeout: number = this.DEFOULT_TIMEOUT;
    if (reqTimout) {
      resoultTimeout = parseInt(reqTimout);
    }
    
    return next.handle(req).pipe(
      tap(req => { 
        if (req instanceof HttpResponse){
          this.SetLoggMessage(req) 
        }
      }),
      timeout(resoultTimeout),
      catchError(err => {
        this.SetLoggMessage(err); 
        return _throw(err);
      }));
  }
}

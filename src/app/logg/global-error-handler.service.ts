import { Injectable , Injector, ErrorHandler  } from '@angular/core';
import { LoggOperatorService } from './logg-operator.service';
import { IloggObject } from '../ilogg';
import { LoggMessageTypes } from '../global_enums'
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {

  private operator : LoggOperatorService;

  constructor(private injector : Injector) {
    this.operator = this.injector.get(LoggOperatorService);
   }

   SetMessage(error: any){

    /// эти ошибки вылавливает интерсептор
    if (error instanceof HttpErrorResponse) {
      return
    }

    let loggMessage: IloggObject;
    
    loggMessage = {
      message_date: new Date(),
      message_name: 'global error handler',
      message_type: LoggMessageTypes.GlobalError,
      message_parametr: [{ name: 'error_content', body: {description : error.description, stack : error.stack }  }]
    } 

    
    this.operator.SetLoggMessage(loggMessage);

   }

   // 
   handleError(error: any) {
      this.SetMessage(error);
      console.log(error)

   } 


  }

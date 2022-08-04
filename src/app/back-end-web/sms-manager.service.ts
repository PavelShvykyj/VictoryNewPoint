import { Injectable } from '@angular/core';
import { LoggMessageTypes } from '../global_enums'
import { LoggOperatorService } from '../logg/logg-operator.service';
import { IloggObject, IloggParametr } from '../ilogg';
import { IdataObject } from '../HallBrowser/idata-object';
import { HttpHeaders, HttpClient } from '@angular/common/http';


@Injectable()
export class SmsManagerService {

  WEB_SERVISE_BLOCED = false;
  SMS_BASE_URL = "sms-fly.com/api/api.php";
  SMS_LOGIN = '380662828954';
  SMS_PASSWORD = 'peremogasms123';

  constructor(private http: HttpClient, private logOperator: LoggOperatorService) { }


  SetLoggMessage(logMessage: IloggObject) {
    this.logOperator.SetLoggMessage(logMessage);
  }

  SetRequstFormatedMessage(messageContent: string) {
    let par: IloggParametr = { name: 'sms content ', body: { content: messageContent } };
    let message: IloggObject = {
      message_type: LoggMessageTypes.Metod,
      message_name: 'send sms',
      message_parametr: [par],
      message_date: new Date()
    };
    this.SetLoggMessage(message);
  }

  private GetSMSFormated(smscontetn: string, smsrecipient: string): string {

    let SmsFormatedString: string = `<?xml version='1.0' encoding='utf-8'?>
  <request>
  <operation>SENDSMS</operation>
  <message start_time=' AUTO ' end_time=' AUTO ' lifetime='4' rate='120' desc='' source='Peremoga'>
  <body>${smscontetn}</body> 
  <recipient>${smsrecipient}</recipient>
  </message>
  </request>`;
    return SmsFormatedString;

  }

  SendSMS(smscontetn: string, smsrecipient: string) {

    let CredentialEncoded = btoa(this.SMS_LOGIN + ": " + this.SMS_PASSWORD);
    let headers = new HttpHeaders().append('Authorization', 'Basic ' + CredentialEncoded).append('Content-Type', 'text/xml')
    let connection = this.SMS_BASE_URL;
    let postBody = this.GetSMSFormated(smscontetn, smsrecipient)
    this.SetRequstFormatedMessage(postBody);
    this.http.post(connection,
      postBody,
      {
        headers: headers,
        observe: 'body',
        withCredentials: true,
        reportProgress: false
      }).toPromise()
      .then(res => { this.SetRequstFormatedMessage('sms Ok: ' + JSON.stringify(res)) })
      .catch(err => { this.SetRequstFormatedMessage('sms err: ' + JSON.stringify(err)) });


  }


}

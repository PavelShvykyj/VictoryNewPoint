import {LoggMessageTypes } from "./global_enums";
import { IdataObject } from "./HallBrowser/idata-object";

export interface IloggParametr {
    name : string;
    body? : IdataObject;
}

export interface IloggObject {
    message_type : LoggMessageTypes;
    message_name : string;
    message_parametr : Array<IloggParametr>;
    message_date : Date;
}
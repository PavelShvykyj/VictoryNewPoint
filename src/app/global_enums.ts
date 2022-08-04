export enum LoggMessageTypes {
  Request,
  Response,
  Metod,
  Interface,
  RequestBody,
  ResponseBody,
  ErrorResponseBody,
  GlobalError
}

export enum TicketOperations {
    Sale,
    Reserve,
    Cansel,
    SaleReserve,
    Nothing,
    CanselPay
  }

  export enum HallShowStatus {
    Defoult,
    Reserving,
    Cancel,
    StartSale,
    Search
  }  

  export enum MessageSate {
    Error,
    Info,
    Sucsess
  }

  export enum ActionType {
    StartSale,
    Reserve,
    Cancel,
    Select

  }
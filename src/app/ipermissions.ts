import { ActionType } from "./global_enums";

export interface IActionParams {
    name : string,
    value : any
}

export interface IAction {
    readonly context : IActionParams 
    type : ActionType
}

export interface IPermission {
    name : string,
    value : boolean,
    parametrs : Array<IActionParams>,
    actions : Array<ActionType> 
}

export interface IUserAccess {
    userPermissions : Array<IPermission>
    CheckPermission(action : IAction) : boolean
    CheckAction(permission: IPermission, action: IAction): boolean
}

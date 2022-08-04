import { IdataObject } from './../idata-object';
import { from } from 'rxjs/observable/from';

import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';


import { Observable } from 'rxjs';

import { tap, filter, first, finalize } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { RequestRouterService } from '../../back-end-router/request-router.service';
import { fromPromise } from 'rxjs/observable/fromPromise';

@Injectable()
export class HallResolver implements Resolve<any> {

    
    webloading = false;
    constructor(private apiServis: RequestRouterService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        console.log('RESOLVER');
        return fromPromise(this.apiServis.RoutGetHallInfo()
                                  .then(hallInfo => 
                                    {
                                        
                                        let chairsInfo: {[key:string] : boolean} = {};
                                        hallInfo.chairsCateoryInfo.chairs.forEach(chair => {
                                            let key : string = chair.c.toString()+'r'+chair.r.toString();
                                            
                                            chairsInfo[key] = chair.isVisible;
                                            
                                        })
                                        let halldata : IdataObject = {chairsInfo:chairsInfo,hallInfo:hallInfo };
                                        console.log('RESOLVER',halldata);
                                        return halldata;
                                    }).catch(error => { return null})) 
    }
}
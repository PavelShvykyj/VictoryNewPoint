import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RequestRouterService} from './request-router.service'
import { ShopModule } from '../shop/shop.module';

@NgModule({
  imports: [
    CommonModule,
    ShopModule
  ],
  providers : [RequestRouterService],
  declarations: []
})
export class BackEndRouterModule { }

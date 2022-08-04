import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RequestManagerService } from './request-manager.service';
@NgModule({
  imports: [
    CommonModule
  ],
  providers : [RequestManagerService],
  declarations: []
})
export class BackEndLocalModule { }

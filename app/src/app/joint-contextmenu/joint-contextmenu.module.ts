import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JointContextmenuComponent } from './joint-contextmenu.component';
import { NzDropDownModule, NzToolTipModule } from 'ng-zorro-antd';



@NgModule({
  declarations: [JointContextmenuComponent],
  exports: [JointContextmenuComponent],
  imports: [
    CommonModule,
    NzDropDownModule,
    NzToolTipModule
  ]
})
export class JointContextmenuModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JointContextmenuComponent } from './joint-contextmenu.component';
import { NzDropDownModule } from 'ng-zorro-antd';



@NgModule({
  declarations: [JointContextmenuComponent],
  exports: [JointContextmenuComponent],
  imports: [
    CommonModule,
    NzDropDownModule
  ]
})
export class JointContextmenuModule { }

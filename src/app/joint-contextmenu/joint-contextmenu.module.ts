import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JointContextmenuComponent } from './joint-contextmenu.component';



@NgModule({
    declarations: [JointContextmenuComponent],
    exports: [JointContextmenuComponent],
    imports: [
        CommonModule
    ]
})
export class JointContextmenuModule { }

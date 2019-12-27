import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgZorroAntdModule, NZ_I18N, zh_TW } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';

import { JointContextmenuModule } from './joint-contextmenu/joint-contextmenu.module';

registerLocaleData(zh);

@NgModule({
  declarations: [AppComponent],
  imports: [
      BrowserModule,
      NgZorroAntdModule,
      FormsModule,
      HttpClientModule,
      BrowserAnimationsModule,
      JointContextmenuModule
  ],
  providers: [{ provide: NZ_I18N, useValue: zh_TW }],
  bootstrap: [AppComponent]
})
export class AppModule { }

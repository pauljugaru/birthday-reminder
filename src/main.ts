import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

import { LOCALE_ID, importProvidersFrom } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeRo from '@angular/common/locales/ro';

import { NZ_I18N, ro_RO } from 'ng-zorro-antd/i18n';

registerLocaleData(localeRo);

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    { provide: LOCALE_ID, useValue: 'ro' },
    { provide: NZ_I18N, useValue: ro_RO }
  ]
}).catch((err) => console.error(err));

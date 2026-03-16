import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';
import { routes } from './app.routes';

const firebaseConfig = {
  apiKey: "AIzaSyDq0KbCvd3mCJTejLB8_XBAQFc6VUGiTxk",
  authDomain: "online-makeup-booking-system.firebaseapp.com",
  projectId: "online-makeup-booking-system",
  storageBucket: "online-makeup-booking-system.firebasestorage.app",
  messagingSenderId: "104953125370",
  appId: "1:104953125370:web:dac457464bc008b028ac43",
  measurementId: "G-0RPBPPDJJV"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnalytics(() => getAnalytics()),
  ]
};
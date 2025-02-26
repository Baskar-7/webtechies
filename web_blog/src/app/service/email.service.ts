import { Injectable } from '@angular/core';
import emailjs from 'emailjs-com';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private serviceId = 'webblog_service_160225';
  private templateId = 'webblog_template_160225';
  private userId = 'wGBIyBu9CylV1Vhol'; 

  constructor() {}

  sendEmail(userEmail: string, userName: string, message: string) {
    const templateParams = {
      from_name: userName,
      message:message,
      user_email: userEmail,
    };

    return emailjs.send(this.serviceId, this.templateId, templateParams, this.userId);
  }
}

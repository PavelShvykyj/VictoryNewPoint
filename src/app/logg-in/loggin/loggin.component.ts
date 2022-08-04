import { Component, OnInit, Output, EventEmitter, ElementRef } from '@angular/core';
import { RequestRouterService } from '../../back-end-router/request-router.service';
import { ILoggInData } from '../../iback-end';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';



class UserData implements ILoggInData {

  userName: string;
  password: string;

  constructor(login: string, password: string) {
    this.userName = login;
    this.password = password;
  }

}

@Component({
  selector: 'app-loggin',
  templateUrl: './loggin.component.html',
  styleUrls: ['./loggin.component.css']
})
export class LogginComponent implements OnInit {

  form: FormGroup = new FormGroup({
    'login': new FormControl("", Validators.required),
    'password': new FormControl("", Validators.required)
  });

  //@Output()loggOn = new EventEmitter(); 

  constructor(private apiServis: RequestRouterService, fb: FormBuilder) { }

  ngOnInit() {
  }

  get login() {
    return this.form.get('login')
  }

  get password() {
    return this.form.get('password')
  }

  Loggin(element) {

    if (element.value == 'WEB') {
      this.apiServis.RoutLoggInByPass(new UserData(this.form.value.login, this.form.value.password))
        .then(
          resoult => {
            if (resoult.status != "200") {
              this.form.setErrors({ errorMessage: "Ошибка авторизации: " + resoult.status + " " + resoult.statusText });
            }
          }
        )
        .catch(resoult => { 
          this.form.setErrors({ errorMessage: resoult.status + " " + resoult.statusText }) 
        });
    }
    else if (element.value == '1C') {
      this.login.setValue("");
      this.password.setValue("");
      this.apiServis.RoutLoggInByLocal()
        .then(
          resoult => {
            if (resoult.status != "200") {
              this.form.setErrors({ errorMessage: "Ошибка авторизации: " + resoult.status + " " + resoult.statusText });
            }
          }
        )
        .catch(
          
          resoult => {
            console.log(this.apiServis.RoutGetStatusError(resoult));  
            this.form.setErrors({ errorMessage: resoult.status + " " + resoult.statusText }); 
            }
        );
    }
  }



  TestLoggIn() {

    this.apiServis.RoutLoggInByPass(new UserData("380662828954", "Di4vF67KBw2T"))
      .then(
        resoult => { this.form.setErrors({ errorMessage: resoult.status + " " + resoult.statusText }) }
      );
  }

}

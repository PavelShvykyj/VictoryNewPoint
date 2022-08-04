import { Component, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import * as _ from 'underscore';
import {RequestRouterService}  from '../../back-end-router/request-router.service';
import { ISessionData, IGetMovieResponseViewModel, IGetSessionResponseViewModel } from '../../iback-end';
import { IdataObject } from '../idata-object';
import 'jquery'; 
import 'jquery-ui/ui/widgets/datepicker.js';


const ONE_DAY = 24*60*60*1000;


@Component({
  selector: 'movie-selector',
  templateUrl: './movie-selector.component.html',
  styleUrls: ['./movie-selector.component.css']
})
export class MovieSelectorComponent implements OnInit, AfterViewInit {

  currentDate : Date;
  currentDays : Array<IdataObject> = [];
  
  currentMovie : IGetMovieResponseViewModel ;
  currentSession : IGetSessionResponseViewModel;
  currentMovies : Array<any> = [];
  currentSessions : Array<any> = [];
  sessionData : ISessionData;
  @Output() sessionDataChange = new EventEmitter();
  pickerHidden : boolean = true;
  $DatePicker;
  $DateList ;  

  constructor(private apiServis : RequestRouterService) { }
  ngOnInit() {
    let dayFormat = {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    };
    
    let itemDay = new Date();
    this.currentDays.push({id : +itemDay, 
      title : itemDay.toLocaleString("ru",dayFormat)
     });

    for (let index = 0; index <= 9; index++) {
      itemDay.setDate(itemDay.getDate() + 1);
      
      this.currentDays.push({id : +itemDay, 
                             title : itemDay.toLocaleString("ru",dayFormat)
                            });
    };
  }

  ngAfterViewInit(){
    
    //($("#datepicker") as any).datepicker();
     //this.pickerHidden = true;
     this.$DatePicker = ($("#inputGroupPickDay") as any);
     this.$DateList   = ($("#inputGroupSelectDay") as any);
     
     this.$DatePicker.datepicker(
       {onSelect : (value, el)=> this.OnSelectDatePicker(value, el),
        minDate: 0,
        dateFormat: "yy.mm.dd",
        dayNamesMin: [ "Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб" ],
        monthNames: [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ]
     }) 
  }


  OnChangeDate(value){
    // clear parametrs first 
    this.currentDate = new Date(+value);
    this.currentMovie = null;
    this.currentSession = null;
    this.sessionData = null;
    this.currentMovies = [];
    this.currentSessions = [];
    
    
    this.apiServis.RoutSessionsGetByDate(this.currentDate.toISOString())
                  .then(resoult => {
                    this.sessionData = resoult;
                    this.SessionDataParse();
                    this.sessionDataChange.emit(
                    { 'currentDate' : this.currentDate, 
                      'currentMovie' : this.currentMovie,
                      'currentSession' : this.currentSession
                    });
                  });
  }

  OnChangeMovie(id){
    this.currentSession = null;
    this.currentSessions = [];
    this.currentMovie = _.find(this.currentMovies,element => {return element.id == id})
    this.currentSessions = _.filter(this.sessionData.sessionInfo, element => { return element.movie.id == id && element.isVisible});
    
    this.sessionDataChange.emit(
      {'currentDate' : this.currentDate, 
        'currentMovie' : this.currentMovie,
        'currentSession' : this.currentSession
      });
  }

  OnChangeSession(id){
    this.currentSession = _.find(this.currentSessions,element => {return element.id == id && element.isVisible})
    this.sessionDataChange.emit(
      {'currentDate' : this.currentDate, 
        'currentMovie' : this.currentMovie,
        'currentSession' : this.currentSession
      });
  }

  SessionDataParse(){
    this.sessionData.movieInfo.forEach(
      movie => {
        this.currentMovies.push(movie)                
    });
    
  }

  OnSelectDatePicker(value : string, el){
    // для совместимости с ИЕ
    let formatedValue = value.replace(RegExp(/\./,'g'),"-");
    //console.log("date picker formatedValue",formatedValue);
    this.OnChangeDate(Date.parse(formatedValue));
  }

  DatePickerChange(){
    this.pickerHidden = !this.pickerHidden;
    this.OnChangeDate(Date.now());
    if (!this.pickerHidden)
    {
      
      setTimeout(()=>{
        this.$DatePicker.datepicker("show");
         
        this.$DatePicker.val(new Date().toLocaleString("ru", {  year: 'numeric',
        month: 'numeric',
        day: 'numeric'}))
        },100);
    } 
    else
    {
      
      this.$DatePicker.datepicker("hide"); 
      $('select option[value='+this.currentDays[0].id+']').prop('selected', true);
      
    }
  }

}

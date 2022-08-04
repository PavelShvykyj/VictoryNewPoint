import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { IGetSessionResponseViewModel, IHallInfo } from '../../iback-end';
import { IdataObject } from '../idata-object';
import * as _ from 'underscore';

@Component({
  selector: 'movie-price',
  templateUrl: './movie-price.component.html',
  styleUrls: ['./movie-price.component.css']
})
export class MoviePriceComponent implements OnInit,OnChanges {

  @Input() sessionInfo : IGetSessionResponseViewModel;
  @Input() hallInfo : IHallInfo;
  priseList : IdataObject = {lists : []};
  constructor() { }

  UdatePriseList(){
    this.priseList = {lists : []};
    if (this.hallInfo && this.sessionInfo)
    {
        this.sessionInfo.prices.forEach(price => {
          let priceItem : IdataObject = {};
          let tickets = [];
          priceItem.categorySeatName = _.find(this.hallInfo.categorySeatsInfo,element => {return element.id == price.idSeatCategory}).name;
          price.tickets.forEach(ticket => {
            let ticketItem : IdataObject = {};
            ticketItem.categoryTicketName = _.find(this.hallInfo.categoryTicketsInfo,element => {return element.id == ticket.idTicketCategory}).name;
            ticketItem.categoryTicketPrice = ticket.price
            tickets.push(ticketItem);
          });
          priceItem.categoryTickets = tickets;
          this.priseList.lists.push(priceItem);  
        });
    }
    else
    {
      this.priseList = {lists : []};
    }
  }

  ngOnInit() {
    //this.UdatePriseList();
  }

  ngOnChanges() {
    this.UdatePriseList();
  }

}

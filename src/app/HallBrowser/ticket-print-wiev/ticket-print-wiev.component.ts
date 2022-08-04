import { Component, OnInit } from '@angular/core';
import 'jquery'; 
//import '../../../../node_modules/jQuery-Print/jQuery.print.js'; 


@Component({
  selector: 'ticket-print-wiev',
  templateUrl: './ticket-print-wiev.component.html',
  styleUrls: ['./ticket-print-wiev.component.css']
})
export class TicketPrintWievComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  TestPrint(){
    //($("#printable") as any).print();
    //($ as any).print('printable');

  }

}

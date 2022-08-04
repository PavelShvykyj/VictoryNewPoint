import { Component, OnInit, Input } from '@angular/core';
import { IGetMovieResponseViewModel } from '../../iback-end';

@Component({
  selector: 'movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css']
})
export class MovieComponent implements OnInit {

  @Input() movieInfo : IGetMovieResponseViewModel

  constructor() { }

  ngOnInit() {
  }

}

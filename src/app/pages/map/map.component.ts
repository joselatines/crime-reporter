import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SpinnerSVGComponent } from "../../assets/svg/spinner-svg/spinner-svg.component";

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [NgIf, NgClass, SpinnerSVGComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent{
  isLoading = true;
  hasError = false;

  constructor() { }

  onIframeMapLoad() {
    this.isLoading = false;
    this.hasError = false;
  }

  onIframeMapError() {
    this.isLoading = false;
    this.hasError = true;
  }
}

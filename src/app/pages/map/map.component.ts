import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { SpinnerSVGComponent } from "../../assets/svg/spinner-svg/spinner-svg.component";

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [NgIf, SpinnerSVGComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {
  isLoading = true;
  hasError = false;

  onIframeMapLoad(){
    this.isLoading = false;
    this.hasError = false;
  }

  onIframeMapError(){
    this.isLoading = false;
    this.hasError = true;
  }
}

import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrapingService } from '../../services/scraping.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  scrapings: any[] = [];

  constructor(private scrapingService: ScrapingService) {}

  ngOnInit(): void {
    this.scrapingService.getScrapings().subscribe({
      next: (data) => {
        this.scrapings = data;
      },
      error: (err) => {
        console.error('Error al obtener scrapings:', err);
      }
    });
  }
}

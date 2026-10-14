import { Component, computed, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  collapsed = signal(false);
  mobileOpen = signal(false);
  title = computed(() => {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    tasks: 'Tasks',
    categories: 'Task Categories'
  };

  const currentRoute = this.path().split('/')[1];

  return titles[currentRoute] || 'Dashboard';
});
  private router = inject(Router);
  path = signal(this.router.url.split('?')[0]);

  constructor() {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.path.set(event.urlAfterRedirects.split('?')[0]);
        this.mobileOpen.set(false);
      });
  }
  toggleMenu(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 800) {
      this.mobileOpen.update(v => !v);
    } else {
      this.collapsed.update(v => !v);
    }
  }
}

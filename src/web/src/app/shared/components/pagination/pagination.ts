import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule, MatIconModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly total = input.required<number>();
  readonly limit = input.required<number>();
  readonly showRange = input(true);
  readonly iconArrows = input(false);

  readonly pageChange = output<number>();

  readonly pages = computed(() => {
    const totalPages = this.totalPages();
    const currentPage = this.page();

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set<number>();

    pages.add(1);
    pages.add(totalPages);
    pages.add(currentPage);

    if (currentPage > 1) {
      pages.add(currentPage - 1);
    }

    if (currentPage < totalPages) {
      pages.add(currentPage + 1);
    }

    if (currentPage <= 3) {
      pages.add(2);
      pages.add(3);
      pages.add(4);
    }

    if (currentPage >= totalPages - 2) {
      pages.add(totalPages - 1);
      pages.add(totalPages - 2);
      pages.add(totalPages - 3);
    }

    return [...pages].sort((a, b) => a - b);
  });

  readonly rangeText = computed(() => {
    if (this.total() === 0) {
      return 'Показано 0 з 0';
    }

    const start = (this.page() - 1) * this.limit() + 1;
    const end = Math.min(this.page() * this.limit(), this.total());

    return `Показано ${start}-${end} з ${this.total()}`;
  });

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page()) {
      return;
    }

    this.pageChange.emit(page);
  }

  shouldShowEllipsisAfter(page: number): boolean {
    const pages = this.pages();
    const index = pages.indexOf(page);
    const nextPage = pages[index + 1];

    return nextPage !== undefined && nextPage - page > 1;
  }
}

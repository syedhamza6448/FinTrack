import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

export interface LucideIconOption {
  /** kebab-case name passed directly to the lucide component */
  name: string;
  /** human-readable label used for search and tooltips */
  label: string;
  /** grouping label shown in the picker grid */
  category: string;
}

@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss'],
  standalone: false,
})
export class IconPickerComponent {
  @Input() selected = 'tag';
  @Output() iconSelected = new EventEmitter<string>();

  isOpen = false;
  searchQuery = '';

  allIcons: LucideIconOption[] = [
    // Finance
    { name: 'wallet', label: 'Wallet', category: 'Finance' },
    { name: 'credit-card', label: 'Credit Card', category: 'Finance' },
    { name: 'building-2', label: 'Bank', category: 'Finance' },
    { name: 'trending-up', label: 'Trending Up', category: 'Finance' },
    { name: 'trending-down', label: 'Trending Down', category: 'Finance' },
    { name: 'banknote', label: 'Banknote', category: 'Finance' },
    { name: 'coins', label: 'Coins', category: 'Finance' },
    { name: 'dollar-sign', label: 'Dollar Sign', category: 'Finance' },
    { name: 'piggy-bank', label: 'Piggy Bank', category: 'Finance' },
    { name: 'receipt', label: 'Receipt', category: 'Finance' },
    { name: 'percent', label: 'Percent', category: 'Finance' },

    // Goals
    { name: 'target', label: 'Target', category: 'Goals' },
    { name: 'trophy', label: 'Trophy', category: 'Goals' },
    { name: 'star', label: 'Star', category: 'Goals' },
    { name: 'rocket', label: 'Rocket', category: 'Goals' },
    { name: 'key', label: 'Key', category: 'Goals' },
    { name: 'shield', label: 'Shield', category: 'Goals' },
    { name: 'flame', label: 'Flame', category: 'Goals' },
    { name: 'zap', label: 'Lightning', category: 'Goals' },

    // Life
    { name: 'home', label: 'Home', category: 'Life' },
    { name: 'car', label: 'Car', category: 'Life' },
    { name: 'plane', label: 'Plane', category: 'Life' },
    { name: 'graduation-cap', label: 'Graduation', category: 'Life' },
    { name: 'gem', label: 'Gem', category: 'Life' },
    { name: 'baby', label: 'Baby', category: 'Life' },
    { name: 'heart-pulse', label: 'Health', category: 'Life' },
    { name: 'umbrella', label: 'Umbrella', category: 'Life' },
    { name: 'globe', label: 'Globe', category: 'Life' },
    { name: 'map-pin', label: 'Location', category: 'Life' },

    // Shopping & Food
    { name: 'utensils', label: 'Food', category: 'Shopping & Food' },
    { name: 'coffee', label: 'Coffee', category: 'Shopping & Food' },
    { name: 'shopping-cart', label: 'Shopping Cart', category: 'Shopping & Food' },
    { name: 'shopping-bag', label: 'Shopping Bag', category: 'Shopping & Food' },

    // Tech & Entertainment
    { name: 'laptop', label: 'Laptop', category: 'Tech' },
    { name: 'smartphone', label: 'Smartphone', category: 'Tech' },
    { name: 'music', label: 'Music', category: 'Tech' },
    { name: 'clapperboard', label: 'Movie', category: 'Tech' },
    { name: 'gamepad-2', label: 'Gaming', category: 'Tech' },

    // Other
    { name: 'tag', label: 'Tag', category: 'Other' },
    { name: 'package', label: 'Package', category: 'Other' },
    { name: 'sprout', label: 'Plant', category: 'Other' },
    { name: 'building', label: 'Office', category: 'Other' },
    { name: 'briefcase', label: 'Briefcase', category: 'Other' },
    { name: 'bar-chart-3', label: 'Bar Chart', category: 'Other' },
  ];

  get filteredIcons(): LucideIconOption[] {
    if (!this.searchQuery.trim()) return this.allIcons;
    const q = this.searchQuery.toLowerCase();
    return this.allIcons.filter((i) => {
      return (
        i.label.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q)
      );
    });
  }

  get categories(): string[] {
    return [...new Set(this.filteredIcons.map((i) => i.category))];
  }

  iconsInCategory(cat: string): LucideIconOption[] {
    return this.filteredIcons.filter((i) => i.category === cat);
  }

  select(name: string): void {
    this.iconSelected.emit(name);
    this.isOpen = false;
    this.searchQuery = '';
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (!target.closest('app-icon-picker')) {
      this.isOpen = false;
    }
  }
}


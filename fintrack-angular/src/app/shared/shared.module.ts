import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Wallet,
  Home,
  Tag,
  Book,
  Bell,
  Settings,
  LayoutGrid,
  ChartBar,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Target,
  Circle,
  Car,
  Utensils,
  ShoppingCart,
  Heart,
  GraduationCap,
  Plane,
  Film,
  Lightbulb,
  Smartphone,
  DollarSign,
  Briefcase,
  Gift,
  Dumbbell,
  Wrench,
  Gamepad2,
  Coffee,
  Sprout,
  Package,
  ArrowUp,
  ArrowDown
} from 'lucide-angular';
import { AbsPipe } from './pipes/abs.pipe';
import { AppIconComponent } from './components/app-icon/app-icon.component';

@NgModule({
  declarations: [AbsPipe, AppIconComponent],
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule.pick({
      Wallet,
      Home,
      Tag,
      Book,
      Bell,
      Settings,
      LayoutGrid,
      ChartBar,
      TrendingUp,
      CreditCard,
      PiggyBank,
      Target,
      Circle,
      Car,
      Utensils,
      ShoppingCart,
      Heart,
      GraduationCap,
      Plane,
      Film,
      Lightbulb,
      Smartphone,
      DollarSign,
      Briefcase,
      Gift,
      Dumbbell,
      Wrench,
      Gamepad2,
      Coffee,
      Sprout,
      Package,
      ArrowUp,
      ArrowDown
    })
  ],
  exports: [
    CommonModule,
    RouterModule,
    AbsPipe,
    AppIconComponent,
    LucideAngularModule
  ]
})
export class SharedModule {}
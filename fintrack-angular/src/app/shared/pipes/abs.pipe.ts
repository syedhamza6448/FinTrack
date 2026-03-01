import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'abs', standalone: false })
export class AbsPipe implements PipeTransform {
  transform(value: number | null | undefined): number {
    if (value == null || Number.isNaN(value)) return 0;
    return Math.abs(value);
  }
}
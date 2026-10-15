import { CanDeactivateFn } from '@angular/router';

export interface PendingForm { canLeave(): boolean; }

export const unsavedChangesGuard: CanDeactivateFn<PendingForm> = (component) => component.canLeave();

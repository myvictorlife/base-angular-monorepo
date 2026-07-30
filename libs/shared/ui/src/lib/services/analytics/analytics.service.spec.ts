import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalyticsService);
  });

  it('stays inert when Firebase is disabled', async () => {
    await expect(service.initialize()).resolves.toBeUndefined();
  });

  it('swallows events instead of throwing when not initialized', () => {
    expect(() => service.logEvent('some_event', { a: 1 })).not.toThrow();
  });

  it('does not throw logging a page view before initialization', () => {
    expect(() => service.logPageView('/profile', 'Profile')).not.toThrow();
  });
});

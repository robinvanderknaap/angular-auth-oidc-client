import { TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FlowsService } from '../flows/flows.service';
import { FlowsServiceMock } from '../flows/flows.service-mock';
import { ResetAuthDataService } from '../flows/reset-auth-data.service';
import { ResetAuthDataServiceMock } from '../flows/reset-auth-data.service-mock';
import { LoggerService } from '../logging/logger.service';
import { LoggerServiceMock } from '../logging/logger.service-mock';
import { IntervallService } from './intervall.service';
import { RefreshSessionRefreshTokenService } from './refresh-session-refresh-token.service';

describe('RefreshSessionRefreshTokenService', () => {
  let refreshSessionRefreshTokenService: RefreshSessionRefreshTokenService;
  let intervalService: IntervallService;
  let resetAuthDataService: ResetAuthDataService;
  let flowsService: FlowsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        RefreshSessionRefreshTokenService,
        { provide: LoggerService, useClass: LoggerServiceMock },
        { provide: FlowsService, useClass: FlowsServiceMock },
        { provide: ResetAuthDataService, useClass: ResetAuthDataServiceMock },
        IntervallService,
      ],
    });
  });

  beforeEach(() => {
    flowsService = TestBed.inject(FlowsService);
    refreshSessionRefreshTokenService = TestBed.inject(RefreshSessionRefreshTokenService);
    intervalService = TestBed.inject(IntervallService);
    resetAuthDataService = TestBed.inject(ResetAuthDataService);
  });

  it('should create', () => {
    expect(refreshSessionRefreshTokenService).toBeTruthy();
  });

  describe('refreshSessionWithRefreshTokens', () => {
    it(
      'calls flowsService.processRefreshToken()',
      waitForAsync(() => {
        const spy = spyOn(flowsService, 'processRefreshToken').and.returnValue(of(null));

        refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens().subscribe(() => {
          expect(spy).toHaveBeenCalled();
        });
      })
    );

    it(
      'resetAuthorizationData and stopPeriodicallTokenCheck in case of error',
      waitForAsync(() => {
        spyOn(flowsService, 'processRefreshToken').and.returnValue(throwError('error'));
        const resetSilentRenewRunningSpy = spyOn(resetAuthDataService, 'resetAuthorizationData');
        const stopPeriodicallyTokenCheckSpy = spyOn(intervalService, 'stopPeriodicallTokenCheck');

        refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens().subscribe({
          error: (err) => {
            expect(resetSilentRenewRunningSpy).toHaveBeenCalled();
            expect(stopPeriodicallyTokenCheckSpy).toHaveBeenCalled();
            expect(err).toBeTruthy();
          },
        });
      })
    );
  });
});

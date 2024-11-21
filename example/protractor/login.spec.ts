import { browser } from 'protractor';
import { HomePage } from './../../pages/homePage.po';
import { User, instUsers, webUsers } from './../../data/users.data';
import { BrowserUtil } from './../../utils/browser.util';
import { LoginUtil } from './../../utils/login.util';

describe('Login - Global Header', () => {
  let homePage;
  let isInstLoggedIn: boolean = false;
  let isWebAccountLoggedIn: boolean = false;
  
  beforeEach(() => {
    homePage = new HomePage();
    homePage.goToPage();
    if (!homePage.isNewNotificationFeatureClosed) {
      homePage.closeNewFeatureNotification();
    }
    BrowserUtil.waitForElementVisibility('.Header .institutional-signin', 2000);
  });

  afterEach(() => {
    // Reset state of page in teardown

    // Should log out if logged in
    if (isInstLoggedIn) {
      homePage.getInstSignOutLink().click();
      isInstLoggedIn = false;
    } else if (isWebAccountLoggedIn) {
      homePage.getWebAcctSignOutLink().click();
      isWebAccountLoggedIn = false;
    }

    // Delete cookie that hides New Feature Notification
    browser.manage().deleteCookie('somerandomcookie');
  });

  describe('Institutional Sign In Modal', () => {
    it('should sign in institutional user after entering valid credentials', () => {
      instUserSpec(homePage.loginInstSignInModal);
    });
  
    it('should add IEEE.org cookie after personal member sign in', () => {
      webAcctUserSpec(homePage.loginInstSignInModal);
    });
  });

  describe('Personal Sign In Popover', () => {
    it('should sign in institutional user after entering valid credentials', () => {
      instUserSpec(homePage.loginPersonalSignInPopover);
    });

    it('should add IEEE.org cookie after personal member sign in', () => {
      webAcctUserSpec(homePage.loginPersonalSignInPopover);
    });
  });

  function instUserSpec(loginFunc: Function) {
    const instUser: User = instUsers[0];
    LoginUtil.instUserLoginSpec(homePage, loginFunc, instUser);
    isInstLoggedIn = true;
  }

  function webAcctUserSpec(loginFunc: Function) {
    const webAccountUser: User = webUsers[0];
    LoginUtil.webAcctUserLoginSpec(homePage, loginFunc, webAccountUser);
    isWebAccountLoggedIn = true;
  }
  
});

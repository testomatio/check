Feature('Auth').tag('user');

Scenario('Login', ({ I })  => {
  I.amOnPage('/')
  I.fillField('email', 'user@user.com');
  I.click('login');
  I.waitForText('Hello', 10);
}).tag('Important').tag('Smoke').tag('Other').tag('T12321');

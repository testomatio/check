
describe('Test Suite #1', function () {
  context('Actions to test', () => {
    beforeEach(() => {
      console.log('Ran beforeEach');
      cy.visit('http://localhost:8080/commands/actions');
    })
    before(() => {
      console.log('Ran before');
      cy.visit('http://localhost:8080/commands/actions');
    })

    it('.type() - type into a DOM element', () => {
      // https://on.cypress.io/type
      cy.get('.action-disabled')
        .type('disabled error checking', { force: true })
        .should('have.value', 'disabled error checking')
    })

    it('.click() - click on a DOM element', () => {
      // https://on.cypress.io/click
      cy.get('.action-btn').click();
    })
    after(async () => {
      console.log('Ran after');
      cy.get('.action-disabled');
  });
  })
})
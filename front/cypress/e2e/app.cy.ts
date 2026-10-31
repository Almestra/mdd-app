describe('Application', () => {
  it('starts in the browser', () => {
    cy.visit('/');

    cy.get('app-root').should('be.visible');
  });
});

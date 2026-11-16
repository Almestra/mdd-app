import { createAccount } from '../support/accounts';

describe('Menu on a phone', () => {
  it('replaces the links of the banner, opens their pages and logs the user out', () => {
    createAccount(`eddie_${Date.now()}`);
    cy.visit('/feed');

    // A computer screen shows the links in the banner, a phone the menu button instead
    cy.get('header nav').should('be.visible');
    cy.get('header button[aria-label="Ouvrir le menu"]').should('not.be.visible');
    cy.viewport(375, 812);
    cy.get('header nav').should('not.be.visible');
    cy.get('header button[aria-label="Ouvrir le menu"]').click();

    // The menu covers the height of the screen, against its right edge
    cy.get('mat-dialog-container').should(($menu) => {
      const screen = $menu[0].ownerDocument.documentElement;
      const rect = $menu[0].getBoundingClientRect();
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(screen.clientWidth);
      expect(rect.bottom).to.equal(screen.clientHeight);
    });

    // A link opens its page and closes the menu
    cy.get('mat-dialog-container').contains('a', 'Thèmes').click();
    cy.location('pathname').should('eq', '/topics');
    cy.get('mat-dialog-container').should('not.exist');

    cy.get('header button[aria-label="Ouvrir le menu"]').click();
    cy.get('mat-dialog-container').contains('button', 'Se déconnecter').click();
    cy.location('pathname').should('eq', '/');
    cy.get('mat-dialog-container').should('not.exist');
  });
});

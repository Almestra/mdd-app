import { createAccount } from '../support/accounts';

describe('Legal pages', () => {
  it('lets a visitor read both pages from the footer of the home page, then come back', () => {
    cy.visit('/');
    // The footer comes with the root component, before the page that the router loads on demand:
    // wait for the home page before measuring
    cy.contains('a', 'Se connecter').should('be.visible');

    // The footer shows at the bottom of the screen, without scrolling
    cy.get('footer').should(($footer) => {
      expect($footer[0].getBoundingClientRect().bottom).to.be.at.most(
        Cypress.config('viewportHeight'),
      );
    });

    cy.get('footer').contains('a', 'Mentions légales').click();
    cy.location('pathname').should('eq', '/legal-notice');
    cy.contains('h1', 'Mentions légales').should('be.visible');

    cy.get('footer').contains('a', 'Politique de confidentialité').click();
    cy.location('pathname').should('eq', '/privacy-policy');
    cy.contains('h1', 'Politique de confidentialité').should('be.visible');

    cy.get('a[aria-label="Retour à l’accueil"]').click();
    cy.location('pathname').should('eq', '/');
  });

  it('lets a logged-in user open them from the footer of the feed, then go back to the feed', () => {
    createAccount(`arthur_${Date.now()}`);
    cy.visit('/feed');

    cy.get('footer').contains('a', 'Mentions légales').click();
    cy.location('pathname').should('eq', '/legal-notice');
    cy.contains('h1', 'Mentions légales').should('be.visible');

    // The back arrow leads home, which sends a logged-in user on to the feed
    cy.get('a[aria-label="Retour à l’accueil"]').click();
    cy.location('pathname').should('eq', '/feed');
  });
});

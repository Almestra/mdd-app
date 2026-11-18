import { createAccount } from '../support/accounts';

describe('Posts', () => {
  const content = 'Écrit en larges lettres amicales sur la couverture du Guide.';

  // Writes a post from the feed: its page opens, then the back arrow leads to the feed again
  function writePost(topic: string, title: string): void {
    cy.intercept('GET', '/api/topics').as('topics');
    cy.contains('a', 'Créer un article').click();
    cy.location('pathname').should('eq', '/posts/new');
    // An empty list does not open: wait for the topics before clicking it
    cy.wait('@topics');
    cy.get('#topic').click();
    cy.contains('mat-option', topic).click();
    cy.get('#title').type(title);
    cy.get('#content').type(content);
    cy.contains('button', 'Créer').click();

    cy.location('pathname').should('match', /^\/posts\/\d+$/);
    cy.get('h1').should('have.text', title);
    cy.get('article').should('contain', topic).and('contain', content);
    cy.get('a[aria-label="Retour au fil d’actualité"]').click();
    cy.location('pathname').should('eq', '/feed');
  }

  it('writes posts in a followed topic, finds them in the feed in both orders and opens one', () => {
    const stamp = Date.now();
    const older = `Pas de panique ${stamp}`;
    const newer = `Cœur en or ${stamp}`;
    createAccount(`zaphod_${stamp}`);

    // Only a followed topic takes posts
    cy.visit('/topics');
    // A static alias keeps the title read on this page; a plain one would look for it again later,
    // on pages that show no topic card
    cy.get('app-topic-card')
      .first()
      .as('card')
      .find('h2')
      .invoke('text')
      .as('topic', { type: 'static' });
    cy.get('@card').contains('button', 'S’abonner').click();
    cy.get('@card').contains('button', 'Déjà abonné').should('be.disabled');

    cy.get('header').contains('a', 'Articles').click();
    cy.get<string>('@topic').then((topic) => {
      writePost(topic.trim(), older);
      writePost(topic.trim(), newer);
    });

    // The newest post comes first, and last once the order is reversed
    cy.get('app-post-card h2').first().should('contain.text', newer);
    cy.contains('button', 'Trier par').click();
    cy.get('app-post-card h2').last().should('contain.text', newer);

    // A click anywhere on a card opens its post
    cy.contains('app-post-card', older).click();
    cy.location('pathname').should('match', /^\/posts\/\d+$/);
    cy.get('h1').should('have.text', older);
  });
});

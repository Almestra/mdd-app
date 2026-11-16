import { createAccount } from '../support/accounts';

describe('Comments', () => {
  const comment = 'Et n’oubliez pas votre serviette.';

  // Sends a request as the logged-in user, with the CSRF token the API expects
  function send(
    method: string,
    url: string,
    body?: object,
  ): Cypress.Chainable<Cypress.Response<{ id: number }>> {
    return cy
      .getCookie('XSRF-TOKEN')
      .then((csrf) =>
        cy.request({ method, url, headers: { 'X-XSRF-TOKEN': csrf?.value ?? '' }, body }),
      );
  }

  it('comments the post of another user, whose page then keeps the comment with its author', () => {
    const stamp = Date.now();
    const reader = `arthur_${stamp}`;

    // Another user follows a topic and writes a post in it, through the API
    createAccount(`ford_${stamp}`);
    cy.request<{ id: number }[]>('/api/topics').then(({ body: topics }) => {
      send('PUT', `/api/topics/${topics[0].id}/subscription`);
      send('POST', '/api/posts', {
        topicId: topics[0].id,
        title: `Globalement inoffensive ${stamp}`,
        content: 'L’article complet sur la Terre.',
      }).as('post');
    });

    // The reader opens it and comments it
    createAccount(reader);
    cy.get<Cypress.Response<{ id: number }>>('@post').then(({ body: post }) =>
      cy.visit(`/posts/${post.id}`),
    );
    cy.get('app-comments').should('contain.text', 'Aucun commentaire pour l’instant.');
    cy.get('#comment').type(comment);
    cy.get('button[aria-label="Envoyer le commentaire"]').click();

    cy.get('app-comments li')
      .should('have.length', 1)
      .and('contain.text', reader)
      .and('contain.text', comment);
    cy.get('#comment').should('have.value', '');

    // The comment is saved: it is still there once the page opens again
    cy.reload();
    cy.get('app-comments li')
      .should('have.length', 1)
      .and('contain.text', reader)
      .and('contain.text', comment);
  });
});

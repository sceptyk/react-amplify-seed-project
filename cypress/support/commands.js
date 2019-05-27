import { configure, shallow } from 'enzyme';

import Adapter from 'enzyme-adapter-react-16';
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

require('@cypress/snapshot').register();

addMatchImageSnapshotCommand();

Cypress.Commands.add('enzyme', () => {
  configure({ adapter: new Adapter() });
});

Cypress.Commands.add('shallow', (children, options) => {
  return shallow(children, options);
});

Cypress.Commands.add('signin', () => {
  return cy
    .window()
    .its('store')
    .invoke('dispatch', {
      type: 'MOCK_SIGNIN'
    });
});

Cypress.Commands.add('visitOnlyLocal', url => {
  cy.server();
  cy.route('POST', '*', () => {
    return Promise.resolve({
      json() {
        return Promise.resolve({});
      },
      ok: true
    });
  });

  return cy.visit(url, {
    onBeforeLoad: win => {
      cy.stub(win, 'fetch', () => {
        return Promise.resolve({
          json() {
            return Promise.resolve({});
          },
          ok: true
        });
      });
    }
  });
});

Cypress.Commands.add('dropFile', { prevSubject: 'element' }, (subject, fileName) => {
  return cy
    .fixture(fileName, 'base64')
    .then(Cypress.Blob.base64StringToBlob)
    .then(blob => {
      // instantiate File from `application` window, not cypress window
      return cy.window().then(win => {
        const file = new win.File([blob], fileName);
        const dataTransfer = new win.DataTransfer();
        dataTransfer.items.add(file);

        return cy.wrap(subject).trigger('drop', {
          dataTransfer
        });
      });
    });
});

Cypress.Commands.add('fillStripe', () => {
  cy.get('iframe[name^="__privateStripeFrame"]').then(iframe => {
    cy.log(iframe.contents());
    const body = iframe.contents().find('body');
    cy.wrap(body)
      .find('input[name="cardnumber"]')
      .type('4242')
      .type('4242')
      .type('4242')
      .type('4242');

    cy.wrap(body)
      .find('input[name="exp-date"]')
      .type('424');
    cy.wrap(body)
      .find('input[name="cvc"]')
      .type('242');
    cy.wrap(body)
      .find('input[name="postal"]')
      .type('42424');
  });
});

// enables intelligent code completion for Cypress commands
// https://on.cypress.io/intelligent-code-completion
/// <reference types="Cypress" />

import PercyAgent from '@percy/agent'

context('Example Cypress TodoMVC test', () => {
  beforeEach(() => {
    // https://on.cypress.io/visit
    cy.visit('/')
  })

  it('adds 2 todos', function () {
    cy.get('.new-todo')
      .type('learn testing{enter}')
      .type('be cool{enter}')
    cy.get('.todo-list li').should('have.length', 2)
  })

  afterEach(() => {
    // how does reporter look after finishing?
    // const reporter = window.top.document.querySelector('.reporter-wrap')
    // reporter.styleSheets = window.top.document.styleSheets
    return fetch('/__cypress/runner/cypress_runner.css')
      .then(r => r.text())
      .then(runnerStyles => {
        // debugger

        const percyAgentClient = new PercyAgent({
          handleAgentCommunication: false,
          domTransformation (dom) {

            const runner = dom.querySelector('.runner.container')
            if (runner && runner.parentElement) {
              runner.parentElement.removeChild(runner)
            }
            // insert style content into the cloned HEAD element
            const style = window.top.document.createElement('style')
            style.type = 'text/css'
            style.appendChild(window.top.document.createTextNode(runnerStyles))
            dom.children[0].appendChild(style)

            return dom
          }
        })

        const domSnapshot = percyAgentClient.snapshot(name, {
          document: window.top.document
        })
        console.log(domSnapshot)

        cy.request({
          method: 'POST',
          url: 'http://localhost:5338/percy/snapshot',
          failOnStatusCode: false,
          body: {
            name: 'after ' + cy.state('runnable').fullTitle(),
            url: location.href,
            // we want to serialize all styles
            enableJavaScript: false,
            domSnapshot
          }
        })
      })
  })

  // more examples
  //
  // https://github.com/cypress-io/cypress-example-todomvc
  // https://github.com/cypress-io/cypress-example-kitchensink
  // https://on.cypress.io/writing-your-first-test
})

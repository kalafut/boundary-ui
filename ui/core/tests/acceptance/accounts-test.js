import { module, test } from 'qunit';
import { visit, currentURL, click, find, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
//   // These are left here intentionally for future reference.
//   //currentSession,
//   //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | accounts', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethods: null,
    account: null,
  };
  const urls = {
    orgScope: null,
    authMethods: null,
    accounts: null,
    newAccount: null,
    account: null,
    setAccountPassword: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
    });
    instances.account = this.server.create('account', {
      scope: instances.scopes.org,
      authMethod: instances.authMethod,
    });

    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
    urls.accounts = `${urls.authMethod}/accounts`;
    urls.newAccount = `${urls.accounts}/new`;
    urls.account = `${urls.accounts}/${instances.account.id}`;
    urls.setAccountPassword = `${urls.accounts}/${instances.account.id}/set-password`;
  });

  hooks.afterEach(async function() {
    const notification = find('.rose-notification');
    if(notification) {
      await click('.rose-notification-dismiss');
    }
  });

  test('visiting accounts', async function (assert) {
    assert.expect(1);
    await visit(urls.accounts);
    await a11yAudit();
    assert.equal(currentURL(), urls.accounts);
  });

  test('can navigate to an account form', async function (assert) {
    assert.expect(1);
    await visit(urls.accounts);
    await click('main tbody .rose-table-header-cell:nth-child(1) a');
    await a11yAudit();
    assert.equal(currentURL(), urls.account);
  });

  test('can update an account and save changes', async function (assert) {
    assert.expect(1);
    await visit(urls.account);
    await fillIn('[name="name"]', 'update name');
    await click('form [type="submit"]:not(:disabled)');
    assert.equal(this.server.db.accounts[0].name, 'update name');
  });

  test('can update an account and cancel changes', async function (assert) {
    assert.expect(1);
    await visit(urls.account)
    await fillIn('[name="name"]', 'update name');
    await click('form button:not([type="submit"])');
    assert.notEqual(this.server.db.accounts[0].name, 'update name');
  });

  test('can create a new account', async function (assert) {
    assert.expect(1);
    const accountsCount = this.server.db.accounts.length;
    await visit(urls.newAccount);
    await fillIn('[name="name"]', 'Account name');
    await fillIn('[name="description"]', 'description');
    await fillIn('[name="login_name"]', 'username');
    await fillIn('[name="password"]', 'password');
    await click('form [type="submit"]:not(:disabled)');
    assert.equal(this.server.db.accounts.length, accountsCount + 1);
  });

  test('can cancel a new account creation', async function (assert) {
    assert.expect(2);
    const accountsCount = this.server.db.accounts.length;
    await visit(urls.newAccount);
    await fillIn('[name="name"]', 'Account name');
    await click('form button:not([type="submit"])');
    assert.equal(this.server.db.accounts.length, accountsCount);
    assert.equal(currentURL(), urls.accounts);
  });

  test('can delete an account', async function (assert) {
    assert.expect(1);
    const accountsCount = this.server.db.accounts.length;
    await visit(urls.account);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(this.server.db.accounts.length, accountsCount - 1);
  });

  test('saving a new account with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/accounts', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        }
      );
    });
    await visit(urls.newAccount);
    await fillIn('[name="name"]', 'new account');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.',
      'Displays primary error message.'
    );
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.',
      'Displays field-level errors.'
    );
  });

  test('errors are displayed when save on account fails', async function (assert) {
    assert.expect(1);
    this.server.patch('/accounts/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        }
      );
    });
    await visit(urls.account);
    await fillIn('[name="name"]', 'save account');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });

  test('errors are displayed when delete on account fails', async function (assert) {
    assert.expect(1);
    this.server.del('/accounts/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        }
      );
    });
    await visit(urls.account);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    await a11yAudit();
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });

  test('saving an existing account with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/accounts/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        }
      );
    });
    await visit(urls.account);
    await fillIn('[name="name"]', 'existing account');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.',
      'Displays primary error message.'
    );
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.',
      'Displays field-level errors.'
    );
  });

  module('password', function() {
    test('can set a new password for account', async function (assert) {
      assert.expect(1);
      this.server.post('/accounts/:id', (_, { requestBody }) => {
        const attrs = JSON.parse(requestBody);
        assert.equal(attrs.password, 'update password', 'new password is set');
      });
      await visit(urls.setAccountPassword);
      await fillIn('[name="password"]', 'update password');
      await click('form [type="submit"]:not(:disabled)');
      await a11yAudit();
    });

    test('can cancel setting new password', async function (assert) {
      assert.expect(1);
      await visit(urls.setAccountPassword);
      await fillIn('[name="password"]', 'update password');
      await click('form button:not([type="submit"])');
      assert.notOk(find('[name="password"]').textContent.trim());
    });

    test('errors are displayed when setting password fails', async function  (assert) {
      assert.expect(1);
      this.server.post('/accounts/:id', () => {
        return new Response(
          490,
          {},
          {
            status: 490,
            code: 'error',
            message: 'Oops.',
          }
        );
      });
      await visit(urls.setAccountPassword);
      await fillIn('[name="password"]', 'update password');
      await click('form [type="submit"]');
      await a11yAudit();
      assert.ok(
        find('[role="alert"]').textContent.trim(),
        'Oops.',
        'Displays primary error message.'
      );
    });
  });
});
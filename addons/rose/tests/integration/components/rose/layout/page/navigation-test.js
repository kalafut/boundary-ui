import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/layout/page/navigation', function (
  hooks
) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Navigation />`);
    assert.ok(find('div'));
    assert.ok(find('.rose-layout-page-navigation'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Navigation id="navigation"/>`);
    assert.ok(find('#navigation'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Navigation>
      <button id="content" />
    </Rose::Layout::Page::Navigation>`);
    assert.ok(find('#content'));
  });
});
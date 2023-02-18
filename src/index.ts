import type { IChangedTiddlers } from 'tiddlywiki';
import { widget as Widget } from '$:/core/modules/widgets/widget.js';

class ExampleWidget extends Widget {
  // constructor(parseTreeNode: IParseTreeNode, options?: unknown) {
  //   super(parseTreeNode, options);
  // }

  refresh(_changedTiddlers: IChangedTiddlers): boolean {
    return false;
  }

  /**
   * Lifecycle method: Render this widget into the DOM
   */
  render(parent: Element, _nextSibling: Element | null): void {
    this.parentDomNode = parent;
    this.computeAttributes();
    this.execute();

    const containerElement = document.createElement('div');
    containerElement.textContent = 'Hello world!';
    this.domNodes.push(containerElement);
    // eslint-disable-next-line unicorn/prefer-dom-node-append
    parent.appendChild(containerElement);
  }
}

declare const exports: Record<string, typeof Widget>;
exports['example-widget'] = ExampleWidget;

import type { Widget as IWidget, IChangedTiddlers } from 'tiddlywiki';

const Widget = require('$:/core/modules/widgets/widget.js').widget as typeof IWidget;

export class ExampleWidget extends Widget {
  constructor(parseTreeNode: any, options: any) {
    super(parseTreeNode, options);
  }

  refresh(changedTiddlers: IChangedTiddlers) {
    return false;
  }

  /**
   * Lifecycle method: Render this widget into the DOM
   */
  render(parent: Node, nextSibling: Node) {
    this.parentDomNode = parent;
    this.execute();

    const containerElement = document.createElement('div');
    this.domNodes.push(containerElement);
    parent.appendChild(containerElement);
  }
}

export const widget = ExampleWidget;

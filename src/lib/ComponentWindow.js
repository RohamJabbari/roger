export class ComponentWindow {
  constructor({ windowName = 'Roger Video Player', windowFeatures = 'width=800,height=550,resizable,scrollbars=no,status=1', replace = false, } = {}) {
      this._windowOptions = ['about:blank', windowName, windowFeatures, replace];
      this.onWindowClose = null;
  }
  get window() {
      if (!this.isOpened) {
          this._window = window.open(...this._windowOptions);
          this.appendCss();
          this.appendContainer();
          this._window.document.title = 'Roger Video Player';
          this.addBeforeUnloadListener();
      }
      return this._window;
  }
  appendCss() {
      const { window: _window } = this;
      const parentStyleElements = Array.from(window.document.querySelectorAll('link[rel="stylesheet"][href^="client/"], style'));
      for (let i = 0; i < parentStyleElements.length; i++) {
          const parentStyleElement = parentStyleElements[i];
          let styleElement;
          switch (parentStyleElement.tagName) {
              case 'LINK':
                  styleElement = _window.document.createElement('link');
                  styleElement.rel = 'stylesheet';
                  styleElement.href = parentStyleElement.href;
                  break;
              case 'STYLE':
                  styleElement = _window.document.createElement('style');
                  styleElement.id = parentStyleElement.id;
                  styleElement.innerHTML = parentStyleElement.innerHTML;
                  break;
              default:
                  throw new Error('Unexpected style element: ' + styleElement.tagName);
          }
          _window.document.head.appendChild(styleElement);
      }
  }
  appendContainer() {
      const { window } = this;
      window.container = window.document.createElement('div');
      window.document.body.appendChild(window.container);
  }
  addBeforeUnloadListener() {
    const { window } = this;
    window.addEventListener('beforeunload', () => {
        if (this.onWindowClose) {
            this.onWindowClose();
        }
        this.attachComponent();
    });
  }
  attachComponent(componentClass, options, newWindow) {
      let { _component } = this;
      if (_component) {
          _component.$destroy();
          this._component = _component = null;
      }
      if (!componentClass) {
          return;
      }
      const { window } = this;
      _component = new componentClass(Object.assign(Object.assign({}, options), { target: window.container, props: { ...options.props, newWindow: window } }));
      this._component = _component;
      window.addEventListener('beforeunload', () => {
          this.attachComponent();
      });
      return _component;
  }
  // endregion
  get isOpened() {
      return this._window && !this._window.closed;
  }
  focus() {
      if (this.isOpened) {
          this._window.focus();
      }
  }
  destroy() {
      this.attachComponent();
      if (this.isOpened) {
          this._window.close();
          this._window = null;
      }
  }
}
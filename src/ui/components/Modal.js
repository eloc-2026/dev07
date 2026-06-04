/**
 * Modal - Reusable modal overlay component
 * Used for tools, detailed views, and confirmations
 */
export class Modal {
  constructor(options = {}) {
    this.title = options.title || 'Modal';
    this.content = options.content || '';
    this.onClose = options.onClose || (() => {});
    this.className = options.className || '';
    this.element = null;
  }

  render() {
    const modal = document.createElement('div');
    modal.className = `modal-overlay ${this.className}`;
    modal.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">${this.title}</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${typeof this.content === 'string' ? this.content : ''}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-cancel">Close</button>
        </div>
      </div>
    `;

    // Attach event listeners
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.modal-cancel');

    closeBtn.addEventListener('click', () => this.close());
    cancelBtn.addEventListener('click', () => this.close());

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.close();
      }
    });

    // If content is an element, append it
    if (this.content instanceof HTMLElement) {
      const body = modal.querySelector('.modal-body');
      body.innerHTML = '';
      body.appendChild(this.content);
    }

    return modal;
  }

  show() {
    this.element = this.render();
    document.body.appendChild(this.element);

    // Trigger animation
    setTimeout(() => {
      this.element.classList.add('active');
    }, 10);

    return this;
  }

  close() {
    if (!this.element) return;

    this.element.classList.remove('active');

    setTimeout(() => {
      if (this.element) {
        this.element.remove();
        this.element = null;
      }
      this.onClose();
    }, 300);
  }

  setContent(content) {
    if (!this.element) return;

    const body = this.element.querySelector('.modal-body');
    if (body) {
      if (typeof content === 'string') {
        body.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        body.innerHTML = '';
        body.appendChild(content);
      }
    }
  }

  setFooter(footerHTML) {
    if (!this.element) return;

    const footer = this.element.querySelector('.modal-footer');
    if (footer) {
      footer.innerHTML = footerHTML;
    }
  }
}

export default Modal;

import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { stockInfoCss } from './stock-info.css.js';
export class StockInfo extends LitElement {
    constructor() {
        super();
        this.previousValue = 1;   // previous price
        this.currentValue = 1;    // current price
        this.history = [];        // last {maxHistory} prices
        this.maxHistory = 6;     // how many previous values do we want to keep
    }
    static styles = [stockInfoCss];
    static properties = {
        previousValue: { type: Number },
        currentValue: { type: Number },
        history: { type: Array },
        name: { type: String },
        symbol: { type: String }
    }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('stock-update', this.onEvent);
    }

    disconnectedCallback() {
        document.removeEventListener('stock-update', this.onEvent);
        super.disconnectedCallback();
    }

    // NOTE: An arrow function is used here so that 'this' is bound to this StockInfo object rather than the caller
    onEvent = (e) => { 
        const { stock, value } = e.detail;

        if(stock !== this.symbol) return;
        
        this.previousValue = this.currentValue;
        this.currentValue = value;
        this.history.push(this.previousValue);
        if(this.history.length >= this.maxHistory) {
            this.history.shift()
        }
    }
    render() {
        const change = this.currentValue - this.previousValue;
        const changePct = ((change / this.previousValue) * 100) || 0;
        const sign = change >= 0 ? '+' : '-';
        const colorCls = change >= 0 ? 'green' : 'red';
        if(!this.name) {
            return html`<p>Oh noo no name!</p>`;
        }
        return html`
        <div class="stock-info">
            <div class="name">
                <strong>${this.name} ${this.symbol}</strong>
            </div>
            <div class="stock-details">
                <div>
                    <div class="value">
                        ${this.currentValue !== null
                        ? '$' + this.currentValue.toFixed(2)
                        : '—'}
                    </div>
                    <div class="change ${colorCls}">
                        ${this.currentValue !== null
                        ? sign + Math.abs(changePct).toFixed(2) + '%'
                        : ''}
                    </div>
                </div>
                <div>
                    <ul class="history">
                    ${this.history.toReversed().map(v => html`<li>$${v.toFixed(2)}</li>`)}
                    </ul>  
                </div>
            </div>
        </div>
        `;
    }
}
customElements.define('stock-info', StockInfo);
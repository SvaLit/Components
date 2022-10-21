import {chain} from "svalit/utils.mjs";
import {html, LitElement} from "lit"
import {SafeUntil} from "svalit/directives.mjs";
import {ContextController} from "svalit/controllers.mjs";
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

class ContextNode extends LitElement {
    context = new ContextController(this, {anyProperty: true})
    safeUntil = new SafeUntil(this)

    static get properties() {
        return {
            data: {type: Object},
            _hydrated: {state: true}
        }
    }

    fetchJSONData() {
        if (!this.renderRoot || !this.renderRoot.querySelector) return;
        const jsonNode = this.renderRoot.querySelector('script[type="application/json"]')
        if (!jsonNode) return;
        Object.assign(this, JSON.parse(jsonNode.innerText))
        return jsonNode.innerText
    }

    assignPropertyData(data) {
        if (!data) return {}
        delete this.data;
        Object.assign(this, data)
        return data;
    }

    renderJSON(json, data) {
        if (this._hydrated) return ''
        return `<script type="application/json">${json || JSON.stringify(data, null, 4)}</script>`
    }

    firstUpdated() {
        requestAnimationFrame(() => this._hydrated = true)
    }

    render() {
        const json = this.fetchJSONData()
        const data = chain(this.data, this.assignPropertyData.bind(this))
        return this.safeUntil(chain(data, data => unsafeHTML(`${this.renderJSON(json, data)}<slot></slot>`)))
    }
}

customElements.define('context-node', ContextNode)

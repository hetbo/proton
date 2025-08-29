class HelloWorldComponent extends HTMLElement {

    private shadow: ShadowRoot;

    constructor() {
        super();

        this.shadow = this.attachShadow({ mode: 'open' });
    }


    connectedCallback() {

        this.shadow.innerHTML = `
            <style>

                p {
                    font-family: sans-serif;
                    padding: 1rem;
                    border: 1px solid #3498db;
                    border-radius: 8px;
                    background-color: #0e77ca;
                    color: #eaeef3;
                }

            </style>

            <p>I'm a TypeScript web component!</p>
        `;
    }
}


customElements.define('hello-world', HelloWorldComponent);

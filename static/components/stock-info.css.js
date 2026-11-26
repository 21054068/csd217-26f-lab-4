import { css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
export const stockInfoCss = css`
        .stock-info {
            display:block;
            border:1px solid #ddd;
            padding:1rem;
            border-radius:4px;
            background:#f9f9f9; margin-bottom:1rem;
            height: 110px;
        }
        .stock-info .name {
            min-height: 2.5em;
        }
        .value   {
            font-size:1.5rem;
            font-weight:bold;
            margin:.5rem 0;
        }
        .change  {
            font-size:1rem;
            font-weight:200;
        }
        .green   { color:#008000; }
        .red     { color:#d32f2f; }
        .history {
            font-size:.85rem;
            color:#555;
            margin-top:.5rem;
        }
        .history li {
            list-style:none;
            margin:0;
            font-size: x-small;
        }
        .stock-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-top: 1px solid black;
        }
    `;
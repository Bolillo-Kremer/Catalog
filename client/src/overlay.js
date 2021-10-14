import { Cart, Item } from "./cart.js";

// -- Private Variables -- //

var src = null;
var productClick = () => {};

/**
 * Creates a product overlay on the catalog
 */
export const Overlay = class Overlay {

    productData = null;

    /**
     * The Source of the product overlay data
     * @param {*} aSrc 
     */
    constructor(aSrc, aOnClick) {
        src = aSrc;
        productClick = aOnClick;
    }

    initOverlay() {
        return new Promise((res, rej) => {
            try {
                $.getJSON(src, data => {
                    this.productData = data;
                    res(data);
                })
            }
            catch(e) {
                rej(e);
            }
        });
    }

    /**
     * Gets the product data for a given page on the catalog
     * @param {Number} aIndex The index of the catalog
     * @returns A JSON object with the page data
     */
    getProducts(aIndex) {
        let lProducts = [];
        if (this.productData.hasOwnProperty(aIndex)) {
            for(let lData of this.productData[aIndex]) {
                lProducts.push(new Product(lData.nodes, new Item(lData.itemID, lData.itemName, lData.itemHandle, 1)))
            }
        }
        return lProducts;
    }

    getSVG(aIndex, aWidth, aHeight, aColor, aScale) {
        let lSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        lSvg.setAttribute("height", aHeight);
        lSvg.setAttribute("width", aWidth);
        lSvg.style.position = "absolute";
        lSvg.style.top = "0";
        lSvg.style.left = "0";

        for(let lProduct of this.getProducts(aIndex)) {
            for(let lPolygon of lProduct.getProductOutline(aColor, aScale)) {
                lSvg.appendChild(lPolygon);
            }         
        }

        return lSvg;
    }
}

export const Product = class Product {
    nodes = [];
    item = null;

    constructor(aNodes, aItem) {
        this.nodes = aNodes;
        this.item = aItem;
    }

    getProductOutline(aColor, aScale) {
        let lPolygons = [];
        
        for (let lNodes of this.nodes) {
            let lPoints = "";
            let lPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

            for (let i = 0; i < lNodes.length; i++) {
                let lNode = lNodes[i];
                lPoints += `${lNode[0] * aScale},${lNode[1] * aScale} `;
            }

            lPolygon.style.fill = "transparent";
            lPolygon.setAttribute("points", lPoints.trim());
            lPolygon.setAttribute("itemId", this.item.id);
            lPolygons.push(lPolygon);
        }

        for (let lPolygon of lPolygons) {
            $(lPolygon).hover(() => {
                for (let lItem of document.querySelectorAll(`[itemId="${this.item.id}"]`)) {
                    lItem.style.fill = aColor;
                }
            }, () => {
                for (let lItem of document.querySelectorAll(`[itemId="${this.item.id}"]`)) {
                    lItem.style.fill = "transparent";
                }
            });

            lPolygon.addEventListener("click", aEvent => {
                //console.log(this.item.id)
                productClick(this.item);
            });
        }

        return lPolygons;
    }
}
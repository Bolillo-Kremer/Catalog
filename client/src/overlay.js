import { Item } from "./cart.js";

// -- Private Variables -- //

var src = null;
var productClick = () => {};

/**
 * Creates a product overlay for the flipbook
 * @param {String} aSrc The source of the product overlay data
 * @param {Function} aOnClick The function to execute when the overlay is clicked 
 */
export const Overlay = class Overlay {

    /**
     * The product overlay data
     */
    productData = null;

    /**
     * Creates a new product overlay for the flipbook
     * @param {String} aSrc The source of the product overlay data
     * @param {Function} aOnClick The function to execute when the overlay is clicked 
     */
    constructor(aSrc, aOnClick) {
        src = aSrc;
        productClick = aOnClick;
    }

    /**
     * Sets up the overlay on each page of the flipbook
     * @returns A promise resolved with the overlay data
     */
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

    /**
     * Creates an SVG element to overlay on the flipbook page based on the product data
     * @param {Number} aIndex The page index of the flipbook to add the overlay to
     * @param {Number} aWidth The width of the overlay 
     * @param {Number} aHeight The height of the overlay
     * @param {String} aColor The color of the overlay 
     * @param {Number} aScale The scale of the overlay compared to the page
     * @returns 
     */
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

/**
 * Class for creating polygon elements for the SVG overlay
 * @param {Array} aNodes An array of nodes to create a polygon
 * @param {Item} aItem The cart item that this product is linked to 
 */
export const Product = class Product {
    /** The nodes of the polygon of this Product */
    nodes = [];
    /** The item that this product is linked to */
    item = null;

    /**
     * Creates SVG elements for the overlay
     * @param {Array} aNodes An array of nodes to create a polygon
     * @param {Item} aItem The cart item that this product is linked to 
     */
    constructor(aNodes, aItem) {
        this.nodes = aNodes;
        this.item = aItem;
    }

    /**
     * Creates a polygon element
     * @param {String} aColor The color of the polygon 
     * @param {Number} aScale The scale of the polygon compared to the size of the page
     * @returns A polygon element
     */
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
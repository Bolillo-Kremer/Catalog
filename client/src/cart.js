/**
 * Class for manipulating shopify cart data
 */
export const Cart = class Cart {
    
    /**
     * Adds a given item to the cart
     * @param {Item} aItem The item to add to the cart
     * @returns A promise resolved with the data from add.js
     */
    static addToCart(aItem) {
        let lItems = [];

        if (Array.isArray(aItem)) {
            for (let lItem of aItem) {
                lItems.push(lItem.serialize());
            }
        }
        else {
            lItems.push(aItem.serialize());
        }

        return new Promise(async (res, rej) => {
            try {
                let lCart = await $.post(`/cart/add.js`, {
                    items: lItems
                });

                res(JSON.parse(lCart))
            }
            catch(e) {
                rej(e);
            }
        });
    }

    /**
     * Updates an item in the cart
     * @param {Item} aItem The item to update
     * @returns A prmoise resolved with data from update.js
     */
    static updateCart(aItem) {
        let lUpdates = { updates: {}};

        if (Array.isArray(aItem)) {
            for (let lItem of aItem) {
                lUpdates.updates[lItem.id] = lItem.quantity;
            }
        }
        else {
            lUpdates.updates[aItem.id] = aItem.quantity;
        }

        return new Promise(async (res, rej) => {
            try {
                res(await $.post(`/cart/update.js`, lUpdates));
            }
            catch(e) {
                rej(e);
            }
        }); 
    } 

    /**
     * Updates the cart note
     * @param {String} aNote The note to add to the cart
     * @returns A prmoise resolved with data from update.js
     */
    static updateCartNote(aNote) {
        return new Promise(async (res, rej) => {
            try {
                res(await $.post(`/cart/update.js`, { note: aNote }));
            }
            catch(e) {
                rej(e);
            }
        });    
    }

    /**
     * Updates the attributes of the cart
     * @param {String} aAttributeName The name of the attribute to update
     * @param {*} aAttribute The value of the attribute
     * @returns A prmoise resolved with data from update.js
     */
    static updateCartAttributes(aAttributeName, aAttribute) {
        return new Promise(async (res, rej) => {
            try {
                res(await $.post(`/cart/update.js`, `attributes[${aAttributeName}]=${aAttribute}`));
            }
            catch(e) {
                rej(e);
            }
        });  
    }

    /**
     * Gets all cart data
     * @returns JSON data from the cart
     */
    static getCart() {
        return new Promise(async (res, rej) => {
            try {
                let lCart = await $.get(`/cart.js`);
                res(JSON.parse(lCart));
            }
            catch (e) {
                rej(e);
            }
        });
    }

    /**
     * Gets all it items from the cart
     * @returns An array of all the item data
     */
    static getItems() {
        return new Promise(async (res, rej) => {
            try {
                let lCart = await $.get(`/cart.js`);
                res(JSON.parse(lCart).items)
            }
            catch(e) {
                rej(e);
            }
        });
    }

    /**
     * Clears all items from the cart
     * @returns A promise resolved with data from clear.js
     */
    static emptyCart() {
        return new Promise(async (res, rej) => {
            try {
                res(await $.post(`/cart/clear.js`));
            }
            catch(e) {
                rej(e);
            }
        });
    }

    /**
     * Downloads the cart data as a JSON file
     */
    static async downloadCartJSON() {
        let lCartData = await Cart.getCart();
        downloadObjectAsJson(lCartData, "Cart");
    }

    /**
     * Downloads the item data as a JSON file
     */
    static async downloadItemsJSON() {
        let lItemData = await Cart.getCart();
        downloadObjectAsJson(lItemData, "Items");
    }
}

/**
 * Class for interfacing with shopify cart items
 * @param {String} aItemID The variant ID of the item
 * @param {String} aItemName The name of the item
 * @param {String} aHandle The handle of the item
 * @param {Number} aQuantity The quantity of the item
 * @param {*} aProperties Any additional properties of the item
 */
export const Item = class Item {
    /** The variant ID of this item */
    id = null;
    /** The name of this item */
    name = null;
    /** The items handle */
    handle = null;
    /** The quantity of this item */
    quantity = null;
    /** Additional properties of this item */
    properties = null;

    /**
     * Creates a new Item object
    * @param {String} aItemID The variant ID of the item
    * @param {String} aItemName The name of the item
    * @param {String} aHandle The handle of the item
    * @param {Number} aQuantity The quantity of the item
    * @param {*} aProperties Any additional properties of the item
     */
    constructor (aItemID, aItemName, aHandle, aQuantity = null, aProperties = null) {
        this.id = aItemID;
        this.name = aItemName;
        this.handle = aHandle;
        this.quantity = aQuantity || 1;
        this.properties = aProperties;
    }

    /**
     * Serializes item data into a JSON object for the shopify cart
     * @returns 
     */
    serialize() {
        let lItem = {};
        lItem.quantity = this.quantity;
        lItem.id = this.id;
        if (this.properties != null) {
            lItem.properties = this.properties;
        }
        return lItem;
    }

    /**
     * Updates this item in the shopify cart
     * @returns A promise resolved with the data from change.js
     */
    update() {
        return new Promise(async (res, rej) => {
            try {
                res(await $.post(`/cart/change.js`, this.serialize()))
            }
            catch(e) {
                rej(e);
            }
        });
    }
}

/**
 * Downloads a given JSON object
 * @param {JSON} exportObj The object to download
 * @param {String} exportName The filename
 */
function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}


export const Cart = class Cart {
    
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

    static getItems() {
        return new Promise(async (res, rej) => {
            try {
                let lCart = await $.get(`/cart.js`);
                res
                res(JSON.parse(lCart).items)
            }
            catch(e) {
                rej(e);
            }
        });
    }

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

    static async downloadCartJSON() {
        let lCartData = await Cart.getCart();
        downloadObjectAsJson(lCartData, "Cart");
    }

    static async downloadItemsJSON() {
        let lItemData = await Cart.getCart();
        downloadObjectAsJson(lItemData, "Items");
    }
}

export const Item = class Item {
    id = null;
    name = null;
    handle = null;
    quantity = null;
    properties = null;

    constructor (aItemID, aItemName, aHandle, aQuantity = null, aProperties = null) {
        this.id = aItemID;
        this.name = aItemName;
        this.handle = aHandle;
        this.quantity = aQuantity || 1;
        this.properties = aProperties;
    }

    serialize() {
        let lItem = {};
        lItem.quantity = this.quantity;
        lItem.id = this.id;
        if (this.properties != null) {
            lItem.properties = this.properties;
        }
        return lItem;
    }

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

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}


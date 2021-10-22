/**
 * Creates a checkout modal to checkout an item
 * @param {HTMLElement} aAppendTo The element to append the modal to
 * @param {String} aInnerHTLM HTML of the modal
 * @param {Number} aPrice The price of the item
 * @param {Function} aOnClick Function to execute if the add to cart button is clicked
 */
export const Checkout = class Checkout {

    popup = true;
    element = null;
    appendTo = null;

    /**
     * Creates a checkout modal to checkout an item
     * @param {HTMLElement} aAppendTo The element to append the modal to
     * @param {String} aInnerHTLM HTML of the modal
     * @param {Number} aPrice The price of the item
     * @param {Function} aOnClick Function to execute if the add to cart button is clicked
     */
    constructor(aAppendTo, aInnerHTML, aPrice, aOnClick) {
        let lModal = simpleElement("div", null, null, {class: "modal"});
        let lModalContent = simpleElement("div", null, null, {class: "modal-content"});
        let lInnerDiv = document.createElement("div");
    
        lModalContent.appendChild(simpleElement("span", null, {innerHTML: "&times;"}, {class: "close"}, createEventListener("click", (aEvent) => {
            aEvent.preventDefault();
            this.hide();
        })));

        let lDescription = document.createElement("div");
        for(let lChild of simpleElement("div", null, {innerHTML: aInnerHTML}).children) {
            if (lChild.tagName.includes("H") && lChild.tagName.length == 2) {
                lDescription.appendChild(document.createElement("br"));
                lDescription.appendChild(lChild);
                lDescription.appendChild(document.createElement("br"));
            }
            else {
                lDescription.appendChild(lChild);
            }
        }

        lInnerDiv.appendChild(lDescription);
        lInnerDiv.appendChild(document.createElement("br"));
        lInnerDiv.appendChild(document.createElement("br"));

        lInnerDiv.appendChild(simpleElement("button", `Add to cart for $${aPrice / 100}`, null, {class : "addtocart"}, 
        createEventListener("click", (aEvent) => {
            aEvent.preventDefault();
            this.hide();
            aOnClick();
        })));
        
        lInnerDiv.appendChild(simpleElement("button", "Cancel", null, {class : "cancel"},
        createEventListener("click", (aEvent) => {
            aEvent.preventDefault();
            this.hide();
        })));
    
        lModalContent.appendChild(lInnerDiv);
        lModal.appendChild(lModalContent);

        this.element = this.popup ? lModal : lModalContent;
        this.appendTo = aAppendTo;
    }

    /**
     * Shows this modal
     */
    show() {
        this.appendTo.appendChild(this.element);
    }

    /**
     * Hides this modal
     */
    hide() {
        this.element.remove();
    }
}

/**
 * Function for creating HTMLElements in a single line of code
 * @param {String} aElement The tagname of the element to create
 * @param {String} aInnerText The inner text of the element
 * @param {JSON} aJSAttributes An object with keys as attribute names and values as attribute values
 * @param {JSON} aDOMAttributes An object with keys as attribute names and values as attribute values
 * @param {Function} aEventListener The event listener for this element
 * @returns A new HTMLElement initialized with the given data
 */
function simpleElement(aElement, aInnerText, aJSAttributes, aDOMAttributes, aEventListener) {
    let lElement = document.createElement(aElement);

    if(aInnerText) {
        lElement.innerText = aInnerText;
    }
    
    if(aJSAttributes) {
        for(let lAttribute of Object.keys(aJSAttributes)) {
            lElement[lAttribute] = aJSAttributes[lAttribute];
        }
    }

    if(aDOMAttributes) {
        for(let lAttribute of Object.keys(aDOMAttributes)) {
            lElement.setAttribute(lAttribute, aDOMAttributes[lAttribute]);
        }
    }

    if(aEventListener) {
        aEventListener(lElement);
    }

    return lElement;
}

/**
 * Creates an event listener object that can be passed an HTMLelement
 * @param {String} aEvent The event to listen for
 * @param {Function} aFunction The function to execute on the event
 * @returns A Function that creates an event listener on a given element
 */
function createEventListener(aEvent, aFunction) {
    return (aElement) => {
        aElement.addEventListener(aEvent, aFunction);
    }
}
export const Checkout = class Checkout {

    element = null;

    constructor(aItemName, aItemDescription, aPrice, aOnClick) {
        let lModal = simpleElement("div", null, null, {class: "modal"});
        let lModalContent = simpleElement("div", null, null, {class: "modal-content"});
        let lInnerDiv = document.createElement("div");
    
        lModalContent.appendChild(simpleElement("span", null, {innerHTML: "&times;"}, {class: "close"}, createEventListener("click", (aEvent) => {
            aEvent.preventDefault();
            this.hide();
        })));
    
        lInnerDiv.appendChild(simpleElement("h1", aItemName));
        lInnerDiv.appendChild(simpleElement("div", null, {innerHTML: aItemDescription}));
        lInnerDiv.appendChild(document.createElement("br"));
        lInnerDiv.appendChild(simpleElement("button", `Add to cart for $${aPrice / 100}`, null, 
        {class : "w3-add-to-cart button  ajax-submit action_button button--add-to-cart  action_button--secondary"}, 
        createEventListener("click", (aEvent) => {
            aEvent.preventDefault();
            this.hide();
            aOnClick();
        })));
        lInnerDiv.appendChild(simpleElement("button", "Cancel", null, 
        {class : "w3-add-to-cart button  ajax-submit action_button button--add-to-cart  action_button--secondary"},
        createEventListener("click", (aEvent) => {
            aEvent.preventDefault();
            this.hide();
        })));
    
        lModalContent.appendChild(lInnerDiv);
        lModal.appendChild(lModalContent);

        this.element = lModal;
    }

    show() {
        document.body.appendChild(this.element);
    }

    hide() {
        this.element.remove();
    }
}

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

function createEventListener(aEvent, aFunction) {
    return (aElement) => {
        aElement.addEventListener(aEvent, aFunction);
    }
}
export const Checkout = class Checkout {

    element = null;

    constructor(aItemDescription, aPrice, aOnClick) {
        let lModal = simpleElement("div", null, null, {class: "modal"});
        let lModalContent = simpleElement("div", null, null, {class: "modal-content"});
        let lInnerDiv = document.createElement("div");
    
        lModalContent.appendChild(simpleElement("span", null, {innerHTML: "&times;"}, {class: "close"}, createEventListener("click", (aEvent) => {
            aEvent.preventDefault();
            this.hide();
        })));

        let lDescription = document.createElement("div");
        for(let lChild of simpleElement("div", null, {innerHTML: aItemDescription}).children) {
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
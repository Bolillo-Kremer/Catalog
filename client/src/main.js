import {FlipBook} from "./flipbook.js";
import {Cart, Item} from "./cart.js"

//#region Properties

const Catalog = $("#flipbook");
const Container = $("#catalogContainer");
const NextPage = $("#next");
const PrevPage = $("#prev");
const HardCovers = false;
const Corners = false;
const ClickTurn = false;
const Debug = false;
const ProductColor = "rgba(164,66,245,0.5)";
const Doc = new FlipBook("https://lavender-life-catalog.herokuapp.com/src/data/Catalog.pdf", 
    "https://lavender-life-catalog.herokuapp.com/src/data/Products.json", 
    pageLoader, 
    productClick, 
    1.5);

//#endregion Properties

//#region Functions

/**
 * Loads the catalog
 */
function init() {
    for(let lMetaData of $("meta")) {
        if (lMetaData.name == "viewport") {
            $(lMetaData).attr("content", "width=2000");
        }
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
    let lPage = getParam("page");

    Container.hide();
    $("#buttonContainer").hide();
    $("#loader").show();

    console.log("Loading Document...");
    Doc.initDocument(() => {
        console.log("Document Loaded.");
        Catalog.turn({
            width: Doc.pageWidth * 2,
            height: Doc.pageHeight,
            autoCenter: false,
            next: true,
            when: {
                turned: onTurn
            }
        });

        if (lPage != null) {
            Catalog.turn("page", lPage);
        }

        Catalog.turn("disable", !ClickTurn);

        Catalog.bind("start", (aEvent, aPageObj, aCorner) => {
            if (aCorner != null && !Corners) {
                aEvent.preventDefault();
            }
        });    

        NextPage.click((aEvent) => {
            pageNav(aEvent);
        });
    
        PrevPage.click((aEvent) => {
            pageNav(aEvent, false);
        });

        //let lScale = getScale(Doc.pageWidth, screen.width, 1);
        let lScale = 1;
        Catalog.css("-webkit-transform", `scale(${lScale})`);
        Catalog.css("-moz-transform", `scale(${lScale})`);
        Catalog.css("-ms-transform", `scale(${lScale})`);
        Catalog.css("transform", `scale(${lScale})`);
        $("#loader").hide();
        $("#buttonContainer").show();
        
        Container.show();
        // let lDomRect = Catalog[0].getBoundingClientRect()
        // Container.width(lDomRect.width);
        // Container.height(lDomRect.height);
    });
}

/**
 * Page nav button handler
 * @param {*} aEvent The click event
 * @param {*} aDirection The direction turned
 */
function pageNav(aEvent, aDirection = true) {
    Catalog.turn("disable", false);
    Catalog.turn(aDirection ? "next" : "previous");
    Catalog.turn("disable", !ClickTurn);
    aEvent.preventDefault();
}

/**
 * Runs on turn
 * @param {*} aEvent 
 * @param {*} aPage 
 * @param {*} aPageObj 
 */
function onTurn(aEvent, aPage, aPageObj) {
    for(let lIndex of aPageObj) {
        if (aPage == 1 || aPage == Doc.pageCount) {
            Catalog.css("width", `${Doc.pageWidth}px`);
        }
        else {
            Catalog.css("width", `${Doc.pageWidth * 2}px`);
        }

        if (lIndex > 0 && lIndex <= Doc.pageCount) {
            let lContainer = document.getElementById(`page${lIndex}`).children[0];
            let lPage = lContainer.children[0];
            lContainer.innerHTML = "";
            lContainer.appendChild(lPage);

            if (!Debug) {
                let lSvg = Doc.getSVG(lIndex, ProductColor);
                lContainer.appendChild(lSvg);
            }
        }
    }
}

/**
 * Runs when a product overlay is clicked
 * @param {*} aItem The item in the overlay
 */
function productClick(aItem) {
    let lBaseUrl = "https://lavender-life.com";
    lBaseUrl = window.location.origin == lBaseUrl ? "" : lBaseUrl;

    $.getJSON(`${lBaseUrl}/products/${aItem.handle}.js`, aProduct => {
        let lVariant = null;

        for(let lPoductVariant of aProduct.variants) {
            if (lPoductVariant.id == aItem.id) {
                lVariant = lPoductVariant;
            }
        }

        if (lVariant != null && lVariant.available) {
            let addToCart = confirm(`Would you like to add "${lVariant.name}" to your cart?\n$${lVariant.price / 100}`);

            if(addToCart) {
                Cart.addToCart(aItem);

                let lCart = document.getElementById("bag").parentElement.parentElement.parentElement;             
                let lQuantity = null;

                if (lCart.children.length != 2) {
                    lQuantity = document.createElement("span");
                    lQuantity.setAttribute("class", "header-cart__count header-cart__count--badge badge");
                    lQuantity.setAttribute("data-bind", "itemCount");
                    lCart.appendChild(lQuantity)
                }
                else {
                    lQuantity = lCart.children[1];
                }         

                
                Cart.getCart().then(lCartData => {
                    lQuantity.innerText = lCartData.item_count;
                    console.log("Added to cart");
                });
            }
        }
        else {
            alert("Sorry, this product is currently out of stock or unavailable");
        }
    });
}

/**
 * Runs every time a page is loaded
 * @param {*} aPage The page
 */
function pageLoader(aPage, aIndex, aPageCount) {
    if (aPage != null) {
        let lLoadingBar = $("#loadingBar");
        lLoadingBar.attr("value", aIndex);
        lLoadingBar.attr("max", aPageCount);
        let lPageContainer = document.createElement("div");
        let lInnerContainer  = document.createElement("div");
        lPageContainer.id = `page${aPage.index}`;
        lInnerContainer.style.position = "relative";
    
        if ((HardCovers && (aPage.index == 0 || aPage.index == 1 || aPage.index == Doc.pageCount - 1 || aPage.index == Doc.pageCount - 2))) {
            lPageContainer.className = "hard";
        }
    

        lInnerContainer.appendChild(aPage.page);
        lPageContainer.appendChild(lInnerContainer);
        Catalog.append(lPageContainer);

        if(Debug) {
            let lPoints = []; 
            aPage.page.addEventListener("click", (aEvent) => {
                let lRect = aPage.page.getBoundingClientRect();
                let x = aEvent.clientX - lRect.left;
                let y = aEvent.clientY - lRect.top;
                lPoints.push([Math.ceil(x/Scale), Math.ceil(y/Scale)]);
    
                let lPointsString = "[";
                for(let lPoint of lPoints) {
                    lPointsString += `[${lPoint[0]},${lPoint[1]}],`
                }
                lPointsString += "]"
                console.log(lPointsString);
            });
        }
    }
}

/**
 * Gets URL paramter name
 * @param {*} aParamName 
 * @returns 
 */
function getParam(aParamName) {
    return new URLSearchParams(window.location.search).get(aParamName);
}

// /**
//  * Gets the appropriate scale for the catalog
//  * @param {*} aScreenWidth 
//  * @param {*} aDefaultDocWidth 
//  * @param {*} aMaxScale 
//  * @returns 
//  */
// function getScale(aScreenWidth, aDefaultDocWidth, aMaxScale) {
//     let lScale = (aScreenWidth / aDefaultDocWidth) / 2;
//     lScale -= 0.2;
//     if (lScale > aMaxScale) {
//         lScale = aMaxScale;
//     }
//     return lScale;
// }

function getScale(aPageWidth, aScreenWidth, aMaxScale) {
    let lScale =  (aScreenWidth / aPageWidth) / 2;
    lScale -= 0.2
    if (lScale > aMaxScale) {
        lScale = aMaxScale;
    }
    return lScale;
}

function getContainerDimensions(aScreenWidth, aPadding, aMaxWidth) {
    let lWidth = (aScreenWidth / 2) - aPadding;
    if (lWidth > aMaxWidth) {
        lWidth = aMaxWidth;
    }
    return {"width": lWidth, "height": lWidth * 1.5};
} 

//#endregion Functions

init();

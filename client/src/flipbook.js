import {PDF} from "./pdf.js";
import {Overlay} from "./overlay.js";

// -- Private Variables -- //
var pageLoader = null;

/**
 * Creates a flipbook that is linked to elements on the HTML page
 * @param {String} aSrc The source of the document
 */
export const FlipBook = class FlipBook {

  /** The scale of the document */
  docScale = 0;
  /** The number of pages in this flipbook */
  pageCount = null;
  /** The current index of this flipbook */
  index = 1;
  /** The PDF object */
  pdf = null;
  /** The Overlay object */
  overlay = null;
  /** The width of the page */
  pageWidth = 0;
  /** The height of the page */
  pageHeight = 0;
  /** The highlight color of the product */
  highlightColor = null;
  

  /**
   * Creates a new FlipBook
   * @param {String} aDocSrc The source of the document
   * @param {Function} aPageLoader The loading function. aLoader(Page)
   */
  constructor(aDocSrc, aDataSrc, aPageLoader, aProductClick, aScale = 1) {     
      pageLoader = aPageLoader;
      this.docScale = aScale;
      this.pdf = new PDF(aDocSrc, aScale);
      this.overlay = new Overlay(aDataSrc, aProductClick);
  }

  /**
   * Initiates the document
   * @param {Function} aPreLoad Function to run before animation. aPreLoad(FirstPage)
   * @returns A promise resolved with the visible pages
   */
  initDocument(aPreLoad) {
    return new Promise(async res => {
      await this.overlay.initOverlay();
      let lFirstPage = await this.pdf.initDocument();
      this.pageWidth = lFirstPage.width;
      this.pageHeight = lFirstPage.height;
      this.pageCount = this.pdf.pageCount;
      await this.getAllPages(); 
      if (aPreLoad != null && aPreLoad != undefined) {
        aPreLoad();
      }     
      res();
    });
  }

  /**
   * Gets a page with a given index
   * @param {Number} aIndex The page index to check
   * @returns A Page object if it exists. Otherwise null
   */
  getPage(aIndex) {
    return new Promise(async res => {
      let lPage = null;
      if (this.pageExists(aIndex)) {
        lPage = new Page(await this.pdf.loadPage(aIndex), aIndex);
      }
      res(lPage);
    });
  }

  /**
   * Checks if a given page exists
   * @param {Number} aIndex The page index to check
   * @returns True if page exists
   */
  pageExists(aIndex) {
    return (aIndex > 0 && aIndex <= this.pageCount);
  }

  getAllPages() {
    return new Promise(async res => {
      for(let i = 0; i < this.pageCount; i++) {
        let lPage = await this.getPage(i + 1);
        if (lPage != null) {
          pageLoader(lPage, i, this.pageCount);
        }
      }
      res();
    });
  }

  getSVG(aIndex, aColor) {
    return this.overlay.getSVG(aIndex, this.pageWidth, this.pageHeight, aColor, this.docScale);
  }
}

export const Page = class Page { 
  page = null;
  index = 0;

  constructor(aPage, aIndex) {
    this.page = aPage;
    this.page.style.position = "absolute";
    this.page.style.top = "0";
    this.page.style.left = "0";
    this.index = aIndex;
  }
}
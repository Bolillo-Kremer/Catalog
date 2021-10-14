// -- Private Variables -- //
var pageRendering = false;
var pageNumPending = null;
var src = null;
var pageScale = 1;

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 * @param aPageIndex Page number.
 */
function queueRenderPage(aPageIndex) {
  return new Promise(async res => {
    if (pageRendering) {
      pageNumPending = aPageIndex;
    } else {
      res(await this.loadPage(aPageIndex));
    }
  });
}

/**
 * Loads a document into a PDF
 * @param {String} aSrc The source of the document
 * @param {Number} aScale The scale of the document pages
 */
export const PDF = class PDF {
  /** This PDF document */
  pdfDoc = null;
  /** The current index of this document */
  pageIndex = 1;
  /** The number of pages in this document */
  pageCount = 0;

  /**
   * Loads a document into a PDF
   * @param {String} aSrc The source of the document
   * @param {Number} aScale The scale of the document pages
   */
  constructor(aSrc, aScale = 1) {
    pageScale = aScale;
    src = aSrc;
  }

  /**
   * Initiates this PDF document
   * @returns A Promise resolved with the first page of this document
   */
  initDocument() {
    return new Promise((res, rej) => {
      try {
        pdfjsLib.getDocument(src).promise.then(aDoc => {
          this.pdfDoc = aDoc;
          this.pageCount = this.pdfDoc.numPages;
          
          this.loadPage(this.pageIndex).then(aPage => {
            res(aPage);
          })
        });
      }
      catch(e) {
        rej(e);
      }
    });
  }

  /**
   * Get page info from document, resize canvas accordingly, and render page.
   * @param aPageIndex Page number.
   */
  loadPage(aPageIndex) {
    return new Promise(res => {
      if (aPageIndex <= 0 || aPageIndex > this.pageCount) {
        res(null);
      }
      pageRendering = true;
      // Using promise to fetch the page
      this.pdfDoc.getPage(aPageIndex).then(aPage => {
        let lViewport = aPage.getViewport({scale: pageScale});
        let lCanvas = document.createElement("canvas");
        let lCtx = lCanvas.getContext("2d");

        lCanvas.height = lViewport.height;
        lCanvas.width = lViewport.width;
  
        // Render PDF page into canvas context
        let lRenderContext = {
          canvasContext: lCtx,
          viewport: lViewport,
        };
        let lRenderTask = aPage.render(lRenderContext);

        // let lImageData = lCtx.getImageData(0, 0, lViewport.width, lViewport.height);
        // lCanvas.height = pageHeight;
        // lCanvas.width = pageWidth;
        // lCtx.putImageData(lImageData, 0, 0, 0, 0, pageWidth, pageHeight);

        res(lCanvas);

        // Wait for rendering to finish
        lRenderTask.promise.then(() => {
          pageRendering = false;
          if (pageNumPending !== null) {
            // New page rendering is pending
            this.loadPage(pageNumPending);
            pageNumPending = null;
          }
        });
      });
    });
  }

  /**
   * Displays previous page.
   */
  getPreviousPage() {
    return new Promise(async (res, rej) => {
      if (this.pageIndex <= 1) {
        rej($`Page index must be between 1 and ${this.pageCount}`);
      }
      else {
        this.pageIndex--;
        res(await queueRenderPage(this.pageIndex));
      }
    });
  }

    /**
   * Displays next page.
   */
  getNextPage() {
    return new Promise(async (res, rej) => {
      if (this.pageIndex >= this.pageCount) {
        rej($`Page index must be between 1 and ${this.pageCount}`);
      }
      else {
        this.pageIndex++;
        res(await queueRenderPage(this.pageIndex));
      }
    });
  }
}
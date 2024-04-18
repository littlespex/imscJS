/* 
 * Copyright (c) 2016, Pierre-Anthony Lemieux <pal@sandflow.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import { processElement } from './processElement.js';

/**
 * Function that maps <pre>smpte:background</pre> URIs to URLs resolving to image resource
 * @callback IMGResolver
 * @param {string} <pre>smpte:background</pre> URI
 * @return {string} PNG resource URL
 */
/**
 * Renders an ISD object (returned by <pre>generateISD()</pre>) into a
 * parent element, that must be attached to the DOM. The ISD will be rendered
 * into a child <pre>div</pre>
 * with heigh and width equal to the clientHeight and clientWidth of the element,
 * unless explicitly specified otherwise by the caller. Images URIs specified
 * by <pre>smpte:background</pre> attributes are mapped to image resource URLs
 * by an <pre>imgResolver</pre> function. The latter takes the value of <code>smpte:background</code>
 * attribute and an <code>img</code> DOM element as input, and is expected to
 * set the <code>src</code> attribute of the <code>img</code> to the absolute URI of the image.
 * <pre>displayForcedOnlyMode</pre> sets the (boolean)
 * value of the IMSC1 displayForcedOnlyMode parameter. The function returns
 * an opaque object that should passed in <code>previousISDState</code> when this function
 * is called for the next ISD, otherwise <code>previousISDState</code> should be set to
 * <code>null</code>.
 *
 * @param {Object} isd ISD to be rendered
 * @param {Object} element Element into which the ISD is rendered
 * @param {?IMGResolver} imgResolver Resolve <pre>smpte:background</pre> URIs into URLs.
 * @param {?number} eheight Height (in pixel) of the child <div>div</div> or null
 *                  to use clientHeight of the parent element
 * @param {?number} ewidth Width (in pixel) of the child <div>div</div> or null
 *                  to use clientWidth of the parent element
 * @param {?boolean} displayForcedOnlyMode Value of the IMSC1 displayForcedOnlyMode parameter,
 *                   or false if null
 * @param {?module:imscUtils.ErrorHandler} errorHandler Error callback
 * @param {Object} previousISDState State saved during processing of the previous ISD, or null if initial call
 * @param {?boolean} enableRollUp Enables roll-up animations (see CEA 708)
 * @return {Object} ISD state to be provided when this function is called for the next ISD
 */
export function renderHTML(isd,
  element,
  imgResolver,
  eheight,
  ewidth,
  displayForcedOnlyMode,
  errorHandler,
  previousISDState,
  enableRollUp
) {
  /* maintain aspect ratio if specified */

  var height = eheight || element.clientHeight;
  var width = ewidth || element.clientWidth;

  if (isd.aspectRatio !== null) {

    var twidth = height * isd.aspectRatio;

    if (twidth > width) {

      height = Math.round(width / isd.aspectRatio);

    } else {

      width = twidth;

    }

  }

  var rootcontainer = document.createElement("div");

  rootcontainer.style.position = "relative";
  rootcontainer.style.width = width + "px";
  rootcontainer.style.height = height + "px";
  rootcontainer.style.margin = "auto";
  rootcontainer.style.top = 0;
  rootcontainer.style.bottom = 0;
  rootcontainer.style.left = 0;
  rootcontainer.style.right = 0;
  rootcontainer.style.zIndex = 0;

  var context = {
    h: height,
    w: width,
    regionH: null,
    regionW: null,
    imgResolver: imgResolver,
    displayForcedOnlyMode: displayForcedOnlyMode || false,
    isd: isd,
    errorHandler: errorHandler,
    previousISDState: previousISDState,
    enableRollUp: enableRollUp || false,
    currentISDState: {},
    flg: null, /* current fillLineGap value if active, null otherwise */
    lp: null, /* current linePadding value if active, null otherwise */
    mra: null, /* current multiRowAlign value if active, null otherwise */
    ipd: null, /* inline progression direction (lr, rl, tb) */
    bpd: null, /* block progression direction (lr, rl, tb) */
    ruby: null, /* is ruby present in a <p> */
    textEmphasis: null, /* is textEmphasis present in a <p> */
    rubyReserve: null /* is rubyReserve applicable to a <p> */
  };

  element.appendChild(rootcontainer);

  if ("contents" in isd) {

    for (var i = 0; i < isd.contents.length; i++) {

      processElement(context, rootcontainer, isd.contents[i], isd);

    }

  }

  return context.currentISDState;

}

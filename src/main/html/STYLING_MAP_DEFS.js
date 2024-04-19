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

import { byName } from '../styles/byName.js';
import { HTMLStylingMapDefinition } from './HTMLStylingMapDefinition.js';
import { RUBYPOSITION_ISWK } from './RUBYPOSITION_ISWK.js';
import { RUBYPOSITION_PROP } from './RUBYPOSITION_PROP.js';


export const STYLING_MAP_DEFS = [
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling backgroundColor",
    function (context, dom_element, isd_element, attr) {

      /* skip if transparent */
      if (attr[3] === 0)
        return;

      dom_element.style.backgroundColor = "rgba(" +
        attr[0].toString() + "," +
        attr[1].toString() + "," +
        attr[2].toString() + "," +
        (attr[3] / 255).toString() +
        ")";
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling color",
    function (context, dom_element, isd_element, attr) {
      dom_element.style.color = "rgba(" +
        attr[0].toString() + "," +
        attr[1].toString() + "," +
        attr[2].toString() + "," +
        (attr[3] / 255).toString() +
        ")";
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling direction",
    function (context, dom_element, isd_element, attr) {

      dom_element.style.direction = attr;

    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling display",
    function () { }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling displayAlign",
    function (context, dom_element, isd_element, attr) {
      /* see https://css-tricks.com/snippets/css/a-guide-to-flexbox/ */

      /* TODO: is this affected by writing direction? */
      dom_element.style.display = "flex";
      dom_element.style.flexDirection = "column";


      if (attr === "before") {

        dom_element.style.justifyContent = "flex-start";

      } else if (attr === "center") {

        dom_element.style.justifyContent = "center";

      } else if (attr === "after") {

        dom_element.style.justifyContent = "flex-end";
      }

    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling extent",
    function (context, dom_element, isd_element, attr) {
      /* TODO: this is super ugly */
      context.regionH = attr.h.toUsedLength(context.w, context.h);
      context.regionW = attr.w.toUsedLength(context.w, context.h);

      /*
          * CSS height/width are measured against the content rectangle,
          * whereas TTML height/width include padding
          */
      let hdelta = 0;
      let wdelta = 0;

      const p = isd_element.styleAttrs["http://www.w3.org/ns/ttml#styling padding"];

      if (!p) {
        /* error */
      } else {

        hdelta = p[0].toUsedLength(context.w, context.h) + p[2].toUsedLength(context.w, context.h);
        wdelta = p[1].toUsedLength(context.w, context.h) + p[3].toUsedLength(context.w, context.h);

      }

      dom_element.style.height = (context.regionH - hdelta) + "px";
      dom_element.style.width = (context.regionW - wdelta) + "px";

    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling fontFamily",
    function (context, dom_element, isd_element, attr) {

      let rslt = [];

      /* per IMSC1 */
      for (let i = 0; i < attr.length; i++) {
        attr[i] = attr[i].trim();

        if (attr[i] === "monospaceSerif") {

          rslt.push("Courier New");
          rslt.push('"Liberation Mono"');
          rslt.push("Courier");
          rslt.push("monospace");

        } else if (attr[i] === "proportionalSansSerif") {

          rslt.push("Arial");
          rslt.push("Helvetica");
          rslt.push('"Liberation Sans"');
          rslt.push("sans-serif");

        } else if (attr[i] === "monospace") {

          rslt.push("monospace");

        } else if (attr[i] === "sansSerif") {

          rslt.push("sans-serif");

        } else if (attr[i] === "serif") {

          rslt.push("serif");

        } else if (attr[i] === "monospaceSansSerif") {

          rslt.push("Consolas");
          rslt.push("monospace");

        } else if (attr[i] === "proportionalSerif") {

          rslt.push("serif");

        } else {

          rslt.push(attr[i]);

        }

      }

      // prune later duplicates we may have inserted 
      if (rslt.length > 0) {

        const unique = [rslt[0]];

        for (let fi = 1; fi < rslt.length; fi++) {

          if (unique.indexOf(rslt[fi]) == -1) {

            unique.push(rslt[fi]);

          }
        }

        rslt = unique;
      }

      dom_element.style.fontFamily = rslt.join(",");
    }
  ),

  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling shear",
    function (context, dom_element, isd_element, attr) {
      /* return immediately if tts:shear is 0% since CSS transforms are not inherited*/

      if (attr === 0)
        return;

      const angle = attr * -0.9;

      /* context.bpd is needed since writing mode is not inherited and sets the inline progression */
      if (context.bpd === "tb") {

        dom_element.style.transform = "skewX(" + angle + "deg)";

      } else {

        dom_element.style.transform = "skewY(" + angle + "deg)";

      }

    }
  ),

  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling fontSize",
    function (context, dom_element, isd_element, attr) {
      dom_element.style.fontSize = attr.toUsedLength(context.w, context.h) + "px";
    }
  ),

  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling fontStyle",
    function (context, dom_element, isd_element, attr) {
      dom_element.style.fontStyle = attr;
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling fontWeight",
    function (context, dom_element, isd_element, attr) {
      dom_element.style.fontWeight = attr;
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling lineHeight",
    function (context, dom_element, isd_element, attr) {
      if (attr === "normal") {

        dom_element.style.lineHeight = "normal";

      } else {

        dom_element.style.lineHeight = attr.toUsedLength(context.w, context.h) + "px";
      }
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling opacity",
    function (context, dom_element, isd_element, attr) {
      dom_element.style.opacity = attr;
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling origin",
    function (context, dom_element, isd_element, attr) {
      dom_element.style.top = attr.h.toUsedLength(context.w, context.h) + "px";
      dom_element.style.left = attr.w.toUsedLength(context.w, context.h) + "px";
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling overflow",
    function (context, dom_element, isd_element, attr) {
      dom_element.style.overflow = attr;
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling padding",
    function (context, dom_element, isd_element, attr) {
      /* attr: top,left,bottom,right*/

      /* style: top right bottom left*/
      const rslt = [];

      rslt[0] = attr[0].toUsedLength(context.w, context.h) + "px";
      rslt[1] = attr[3].toUsedLength(context.w, context.h) + "px";
      rslt[2] = attr[2].toUsedLength(context.w, context.h) + "px";
      rslt[3] = attr[1].toUsedLength(context.w, context.h) + "px";

      dom_element.style.padding = rslt.join(" ");
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling position",
    function (context, dom_element, isd_element, attr) {
      dom_element.style.top = attr.h.toUsedLength(context.w, context.h) + "px";
      dom_element.style.left = attr.w.toUsedLength(context.w, context.h) + "px";
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling rubyAlign",
    function (context, dom_element, isd_element, attr) {
      dom_element.style.rubyAlign = attr === "spaceAround" ? "space-around" : "center";
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling rubyPosition",
    function (context, dom_element, isd_element, attr) {
      /* skip if "outside", which is handled by applyRubyPosition() */

      if (attr === "before" || attr === "after") {

        let pos;

        if (RUBYPOSITION_ISWK) {

          /* WebKit exception */
          pos = attr;

        } else if (context.bpd === "tb") {

          pos = (attr === "before") ? "over" : "under";


        } else {

          if (context.bpd === "rl") {

            pos = (attr === "before") ? "over" : "under";

          } else {

            pos = (attr === "before") ? "under" : "over";

          }

        }

        /* apply position to the parent dom_element, i.e. ruby or rtc */
        dom_element.parentElement.style[RUBYPOSITION_PROP] = pos;
      }
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling showBackground",
    null
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling textAlign",
    function (context, dom_element, isd_element, attr) {

      let ta;

      /* handle UAs that do not understand start or end */
      if (attr === "start") {

        ta = (context.ipd === "rl") ? "right" : "left";

      } else if (attr === "end") {

        ta = (context.ipd === "rl") ? "left" : "right";

      } else {

        ta = attr;

      }

      dom_element.style.textAlign = ta;

    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling textDecoration",
    function (context, dom_element, isd_element, attr) {
      dom_element.style.textDecoration = attr.join(" ").replace("lineThrough", "line-through");
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling textOutline",
    function () {
      /* defer to tts:textShadow */
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling textShadow",
    function (context, dom_element, isd_element, attr) {

      const txto = isd_element.styleAttrs[byName.textOutline.qname];

      if (attr === "none" && txto === "none") {

        dom_element.style.textShadow = "";

      } else {

        const s = [];

        if (txto !== "none") {

          /* emulate text outline */
          const to_color = "rgba(" +
            txto.color[0].toString() + "," +
            txto.color[1].toString() + "," +
            txto.color[2].toString() + "," +
            (txto.color[3] / 255).toString() +
            ")";

          s.push("1px 1px 1px " + to_color);
          s.push("-1px 1px 1px " + to_color);
          s.push("1px -1px 1px " + to_color);
          s.push("-1px -1px 1px " + to_color);

        }

        /* add text shadow */
        if (attr !== "none") {

          for (let i = 0; i < attr.length; i++) {

            s.push(attr[i].x_off.toUsedLength(context.w, context.h) + "px " +
              attr[i].y_off.toUsedLength(context.w, context.h) + "px " +
              attr[i].b_radius.toUsedLength(context.w, context.h) + "px " +
              "rgba(" +
              attr[i].color[0].toString() + "," +
              attr[i].color[1].toString() + "," +
              attr[i].color[2].toString() + "," +
              (attr[i].color[3] / 255).toString() +
              ")"
            );

          }

        }

        dom_element.style.textShadow = s.join(",");

      }
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling textCombine",
    function (context, dom_element, isd_element, attr) {

      dom_element.style.textCombineUpright = attr;

    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling textEmphasis",
    function () {
      /* applied as part of HTML document construction */
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling unicodeBidi",
    function (context, dom_element, isd_element, attr) {

      let ub;

      if (attr === 'bidiOverride') {
        ub = "bidi-override";
      } else {
        ub = attr;
      }

      dom_element.style.unicodeBidi = ub;
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling visibility",
    function (context, dom_element, isd_element, attr) {
      dom_element.style.visibility = attr;
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling wrapOption",
    function (context, dom_element, isd_element, attr) {

      if (attr === "wrap") {

        if (isd_element.space === "preserve") {
          dom_element.style.whiteSpace = "pre-wrap";
        } else {
          dom_element.style.whiteSpace = "normal";
        }

      } else {

        if (isd_element.space === "preserve") {

          dom_element.style.whiteSpace = "pre";

        } else {
          dom_element.style.whiteSpace = "noWrap";
        }

      }

    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling writingMode",
    function (context, dom_element, isd_element, attr) {

      if (attr === "lrtb" || attr === "lr") {

        dom_element.style.writingMode = "horizontal-tb";

      } else if (attr === "rltb" || attr === "rl") {

        dom_element.style.writingMode = "horizontal-tb";

      } else if (attr === "tblr") {

        dom_element.style.writingMode = "vertical-lr";

      } else if (attr === "tbrl" || attr === "tb") {

        dom_element.style.writingMode = "vertical-rl";

      }

    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml#styling zIndex",
    function (context, dom_element, isd_element, attr) {
      dom_element.style.zIndex = attr;
    }
  ),
  new HTMLStylingMapDefinition(
    "http://www.w3.org/ns/ttml/profile/imsc1#styling forcedDisplay",
    function (context, dom_element, isd_element, attr) {

      if (context.displayForcedOnlyMode && attr === false) {
        dom_element.style.visibility = "hidden";
      }

    }
  )
];

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

import sax from 'sax';
import { reportError } from '../error/reportError.js';
import { reportFatal } from '../error/reportFatal.js';
import { imscNames } from '../imscNames.js';
import { byName } from '../styles/byName.js';
import { AnonymousSpan } from './AnonymousSpan.js';
import { Body } from './Body.js';
import { Br } from './Br.js';
import { Div } from './Div.js';
import { ForeignElement } from './ForeignElement.js';
import { Head } from './Head.js';
import { Image } from './Image.js';
import { Initial } from './Initial.js';
import { Layout } from './Layout.js';
import { P } from './P.js';
import { Region } from './Region.js';
import { Set } from './Set.js';
import { Span } from './Span.js';
import { Style } from './Style.js';
import { Styling } from './Styling.js';
import { TT } from './TT.js';
import { cleanRubyContainers } from './cleanRubyContainers.js';
import { mergeChainedStyles } from './mergeChainedStyles.js';
import { mergeReferencedStyles } from './mergeReferencedStyles.js';
import { mergeStylesIfNotPresent } from './mergeStylesIfNotPresent.js';
import { resolveTiming } from './resolveTiming.js';

/**
 * Parses an IMSC1 document into an opaque in-memory representation that exposes
 * a single method <pre>getMediaTimeEvents()</pre> that returns a list of time
 * offsets (in seconds) of the ISD, i.e. the points in time where the visual
 * representation of the document change. `metadataHandler` allows the caller to
 * be called back when nodes are present in <metadata> elements.
 *
 * @param {string} xmlstring XML document
 * @param {?module:imscUtils.ErrorHandler} errorHandler Error callback
 * @param {?MetadataHandler} metadataHandler Callback for <Metadata> elements
 * @returns {Object} Opaque in-memory representation of an IMSC1 document
 */

export function fromXML(xmlstring, errorHandler, metadataHandler) {
  var p = sax.parser(true, { xmlns: true });
  var estack = [];
  var xmllangstack = [];
  var xmlspacestack = [];
  var metadata_depth = 0;
  var doc = null;

  p.onclosetag = function (node) {


    if (estack[0] instanceof Region) {

      /* merge referenced styles */
      if (doc.head !== null && doc.head.styling !== null) {
        mergeReferencedStyles(doc.head.styling, estack[0].styleRefs, estack[0].styleAttrs, errorHandler);
      }

      delete estack[0].styleRefs;

    } else if (estack[0] instanceof Styling) {

      /* flatten chained referential styling */
      for (var sid in estack[0].styles) {

        if (!estack[0].styles.hasOwnProperty(sid)) continue;

        mergeChainedStyles(estack[0], estack[0].styles[sid], errorHandler);

      }

    } else if (estack[0] instanceof P || estack[0] instanceof Span) {

      /* merge anonymous spans */
      if (estack[0].contents.length > 1) {

        var cs = [estack[0].contents[0]];

        var c;

        for (c = 1; c < estack[0].contents.length; c++) {

          if (estack[0].contents[c] instanceof AnonymousSpan &&
            cs[cs.length - 1] instanceof AnonymousSpan) {

            cs[cs.length - 1].text += estack[0].contents[c].text;

          } else {

            cs.push(estack[0].contents[c]);

          }

        }

        estack[0].contents = cs;

      }

      // remove redundant nested anonymous spans (9.3.3(1)(c))
      if (estack[0] instanceof Span &&
        estack[0].contents.length === 1 &&
        estack[0].contents[0] instanceof AnonymousSpan) {

        estack[0].text = estack[0].contents[0].text;
        delete estack[0].contents;

      }

    } else if (estack[0] instanceof ForeignElement) {

      if (estack[0].node.uri === imscNames.ns_tt &&
        estack[0].node.local === 'metadata') {

        /* leave the metadata element */
        metadata_depth--;

      } else if (metadata_depth > 0 &&
        metadataHandler &&
        'onCloseTag' in metadataHandler) {

        /* end of child of metadata element */
        metadataHandler.onCloseTag();

      }

    }

    // TODO: delete stylerefs?
    // maintain the xml:space stack
    xmlspacestack.shift();

    // maintain the xml:lang stack
    xmllangstack.shift();

    // prepare for the next element
    estack.shift();
  };

  p.ontext = function (str) {

    if (estack[0] === undefined) {
      /* ignoring text outside of elements */
    } else if (estack[0] instanceof Span || estack[0] instanceof P) {

      /* ignore children text nodes in ruby container spans */
      if (estack[0] instanceof Span) {

        var ruby = estack[0].styleAttrs[byName.ruby.qname];

        if (ruby === 'container' || ruby === 'textContainer' || ruby === 'baseContainer') {

          return;

        }

      }

      /* create an anonymous span */
      var s = new AnonymousSpan();

      s.initFromText(doc, estack[0], str, xmllangstack[0], xmlspacestack[0], errorHandler);

      estack[0].contents.push(s);

    } else if (estack[0] instanceof ForeignElement &&
      metadata_depth > 0 &&
      metadataHandler &&
      'onText' in metadataHandler) {

      /* text node within a child of metadata element */
      metadataHandler.onText(str);

    }

  };


  p.onopentag = function (node) {
    // maintain the xml:space stack

    var xmlspace = node.attributes["xml:space"];

    if (xmlspace) {

      xmlspacestack.unshift(xmlspace.value);

    } else {

      if (xmlspacestack.length === 0) {

        xmlspacestack.unshift("default");

      } else {

        xmlspacestack.unshift(xmlspacestack[0]);

      }

    }

    /* maintain the xml:lang stack */
    var xmllang = node.attributes["xml:lang"];

    if (xmllang) {

      xmllangstack.unshift(xmllang.value);

    } else {

      if (xmllangstack.length === 0) {

        xmllangstack.unshift("");

      } else {

        xmllangstack.unshift(xmllangstack[0]);

      }

    }


    /* process the element */
    if (node.uri === imscNames.ns_tt) {

      if (node.local === 'tt') {

        if (doc !== null) {

          reportFatal(errorHandler, "Two <tt> elements at (" + this.line + "," + this.column + ")");

        }

        doc = new TT();

        doc.initFromNode(node, xmllangstack[0], errorHandler);

        estack.unshift(doc);

      } else if (node.local === 'head') {

        if (!(estack[0] instanceof TT)) {
          reportFatal(errorHandler, "Parent of <head> element is not <tt> at (" + this.line + "," + this.column + ")");
        }

        estack.unshift(doc.head);

      } else if (node.local === 'styling') {

        if (!(estack[0] instanceof Head)) {
          reportFatal(errorHandler, "Parent of <styling> element is not <head> at (" + this.line + "," + this.column + ")");
        }

        estack.unshift(doc.head.styling);

      } else if (node.local === 'style') {

        var s;

        if (estack[0] instanceof Styling) {

          s = new Style();

          s.initFromNode(node, errorHandler);

          /* ignore <style> element missing @id */
          if (!s.id) {

            reportError(errorHandler, "<style> element missing @id attribute");

          } else {

            doc.head.styling.styles[s.id] = s;

          }

          estack.unshift(s);

        } else if (estack[0] instanceof Region) {

          /* nested styles can be merged with specified styles
              * immediately, with lower priority
              * (see 8.4.4.2(3) at TTML1 )
              */
          s = new Style();

          s.initFromNode(node, errorHandler);

          mergeStylesIfNotPresent(s.styleAttrs, estack[0].styleAttrs);

          estack.unshift(s);

        } else {

          reportFatal(errorHandler, "Parent of <style> element is not <styling> or <region> at (" + this.line + "," + this.column + ")");

        }

      } else if (node.local === 'initial') {

        var ini;

        if (estack[0] instanceof Styling) {

          ini = new Initial();

          ini.initFromNode(node, errorHandler);

          for (var qn in ini.styleAttrs) {

            if (!ini.styleAttrs.hasOwnProperty(qn)) continue;

            doc.head.styling.initials[qn] = ini.styleAttrs[qn];

          }

          estack.unshift(ini);

        } else {

          reportFatal(errorHandler, "Parent of <initial> element is not <styling> at (" + this.line + "," + this.column + ")");

        }

      } else if (node.local === 'layout') {

        if (!(estack[0] instanceof Head)) {

          reportFatal(errorHandler, "Parent of <layout> element is not <head> at " + this.line + "," + this.column + ")");

        }

        estack.unshift(doc.head.layout);

      } else if (node.local === 'region') {

        if (!(estack[0] instanceof Layout)) {
          reportFatal(errorHandler, "Parent of <region> element is not <layout> at " + this.line + "," + this.column + ")");
        }

        var r = new Region();

        r.initFromNode(doc, node, xmllangstack[0], errorHandler);

        if (!r.id || r.id in doc.head.layout.regions) {

          reportError(errorHandler, "Ignoring <region> with duplicate or missing @id at " + this.line + "," + this.column + ")");

        } else {

          doc.head.layout.regions[r.id] = r;

        }

        estack.unshift(r);

      } else if (node.local === 'body') {

        if (!(estack[0] instanceof TT)) {

          reportFatal(errorHandler, "Parent of <body> element is not <tt> at " + this.line + "," + this.column + ")");

        }

        if (doc.body !== null) {

          reportFatal(errorHandler, "Second <body> element at " + this.line + "," + this.column + ")");

        }

        var b = new Body();

        b.initFromNode(doc, node, xmllangstack[0], errorHandler);

        doc.body = b;

        estack.unshift(b);

      } else if (node.local === 'div') {

        if (!(estack[0] instanceof Div || estack[0] instanceof Body)) {

          reportFatal(errorHandler, "Parent of <div> element is not <body> or <div> at " + this.line + "," + this.column + ")");

        }

        var d = new Div();

        d.initFromNode(doc, estack[0], node, xmllangstack[0], errorHandler);

        /* transform smpte:backgroundImage to TTML2 image element */
        var bi = d.styleAttrs[byName.backgroundImage.qname];

        if (bi) {
          d.contents.push(new Image(bi));
          delete d.styleAttrs[byName.backgroundImage.qname];
        }

        estack[0].contents.push(d);

        estack.unshift(d);

      } else if (node.local === 'image') {

        if (!(estack[0] instanceof Div)) {

          reportFatal(errorHandler, "Parent of <image> element is not <div> at " + this.line + "," + this.column + ")");

        }

        var img = new Image();

        img.initFromNode(doc, estack[0], node, xmllangstack[0], errorHandler);

        estack[0].contents.push(img);

        estack.unshift(img);

      } else if (node.local === 'p') {

        if (!(estack[0] instanceof Div)) {

          reportFatal(errorHandler, "Parent of <p> element is not <div> at " + this.line + "," + this.column + ")");

        }

        var p = new P();

        p.initFromNode(doc, estack[0], node, xmllangstack[0], errorHandler);

        estack[0].contents.push(p);

        estack.unshift(p);

      } else if (node.local === 'span') {

        if (!(estack[0] instanceof Span || estack[0] instanceof P)) {

          reportFatal(errorHandler, "Parent of <span> element is not <span> or <p> at " + this.line + "," + this.column + ")");

        }

        var ns = new Span();

        ns.initFromNode(doc, estack[0], node, xmllangstack[0], xmlspacestack[0], errorHandler);

        estack[0].contents.push(ns);

        estack.unshift(ns);

      } else if (node.local === 'br') {

        if (!(estack[0] instanceof Span || estack[0] instanceof P)) {

          reportFatal(errorHandler, "Parent of <br> element is not <span> or <p> at " + this.line + "," + this.column + ")");

        }

        var nb = new Br();

        nb.initFromNode(doc, estack[0], node, xmllangstack[0], errorHandler);

        estack[0].contents.push(nb);

        estack.unshift(nb);

      } else if (node.local === 'set') {

        if (!(estack[0] instanceof Span ||
          estack[0] instanceof P ||
          estack[0] instanceof Div ||
          estack[0] instanceof Body ||
          estack[0] instanceof Region ||
          estack[0] instanceof Br)) {

          reportFatal(errorHandler, "Parent of <set> element is not a content element or a region at " + this.line + "," + this.column + ")");

        }

        var st = new Set();

        st.initFromNode(doc, estack[0], node, errorHandler);

        estack[0].sets.push(st);

        estack.unshift(st);

      } else {

        /* element in the TT namespace, but not a content element */
        estack.unshift(new ForeignElement(node));
      }

    } else {

      /* ignore elements not in the TTML namespace unless in metadata element */
      estack.unshift(new ForeignElement(node));

    }

    /* handle metadata callbacks */
    if (estack[0] instanceof ForeignElement) {

      if (node.uri === imscNames.ns_tt &&
        node.local === 'metadata') {

        /* enter the metadata element */
        metadata_depth++;

      } else if (metadata_depth > 0 &&
        metadataHandler &&
        'onOpenTag' in metadataHandler) {

        /* start of child of metadata element */
        var attrs = [];

        for (var a in node.attributes) {
          attrs[node.attributes[a].uri + " " + node.attributes[a].local] =
          {
            uri: node.attributes[a].uri,
            local: node.attributes[a].local,
            value: node.attributes[a].value
          };
        }

        metadataHandler.onOpenTag(node.uri, node.local, attrs);

      }

    }

  };

  // parse the document
  p.write(xmlstring).close();

  // all referential styling has been flatten, so delete styles
  delete doc.head.styling.styles;

  // create default region if no regions specified
  var hasRegions = false;

  /* AFAIK the only way to determine whether an object has members */
  for (var i in doc.head.layout.regions) {

    if (doc.head.layout.regions.hasOwnProperty(i)) {
      hasRegions = true;
      break;
    }

  }

  if (!hasRegions) {

    /* create default region */
    var dr = Region.prototype.createDefaultRegion(doc.lang);

    doc.head.layout.regions[dr.id] = dr;

  }

  /* resolve desired timing for regions */
  for (var region_i in doc.head.layout.regions) {

    if (!doc.head.layout.regions.hasOwnProperty(region_i)) continue;

    resolveTiming(doc, doc.head.layout.regions[region_i], null, null);

  }

  /* resolve desired timing for content elements */
  if (doc.body) {
    resolveTiming(doc, doc.body, null, null);
  }

  /* remove undefined spans in ruby containers */
  if (doc.body) {
    cleanRubyContainers(doc.body);
  }

  return doc;
}

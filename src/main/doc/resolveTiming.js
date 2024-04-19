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

export function resolveTiming(doc, element, prev_sibling, parent) {
  /* are we in a seq container? */

  const isinseq = parent && parent.timeContainer === 'seq';

  /* determine implicit begin */
  let implicit_begin = 0; /* default */

  if (parent) {

    if (isinseq && prev_sibling) {

      /*
          * if seq time container, offset from the previous sibling end
          */
      implicit_begin = prev_sibling.end;

    } else {

      implicit_begin = parent.begin;

    }

  }

  /* compute desired begin */
  element.begin = element.explicit_begin ? element.explicit_begin + implicit_begin : implicit_begin;

  /* determine implicit end */
  let implicit_end = element.begin;

  let s = null;

  if ('sets' in element) {

    for (let set_i = 0; set_i < element.sets.length; set_i++) {

      resolveTiming(doc, element.sets[set_i], s, element);

      if (element.timeContainer === 'seq') {

        implicit_end = element.sets[set_i].end;

      } else {

        implicit_end = Math.max(implicit_end, element.sets[set_i].end);

      }

      s = element.sets[set_i];

    }

  }

  if (!('contents' in element)) {

    /* anonymous spans and regions and <set> and <br>s and spans with only children text nodes */
    if (isinseq) {

      /* in seq container, implicit duration is zero */
      implicit_end = element.begin;

    } else {

      /* in par container, implicit duration is indefinite */
      implicit_end = Number.POSITIVE_INFINITY;

    }

  } else if ('contents' in element) {

    for (let content_i = 0; content_i < element.contents.length; content_i++) {

      resolveTiming(doc, element.contents[content_i], s, element);

      if (element.timeContainer === 'seq') {

        implicit_end = element.contents[content_i].end;

      } else {

        implicit_end = Math.max(implicit_end, element.contents[content_i].end);

      }

      s = element.contents[content_i];

    }

  }

  /* determine desired end */
  /* it is never made really clear in SMIL that the explicit end is offset by the implicit begin */
  if (element.explicit_end !== null && element.explicit_dur !== null) {

    element.end = Math.min(element.begin + element.explicit_dur, implicit_begin + element.explicit_end);

  } else if (element.explicit_end === null && element.explicit_dur !== null) {

    element.end = element.begin + element.explicit_dur;

  } else if (element.explicit_end !== null && element.explicit_dur === null) {

    element.end = implicit_begin + element.explicit_end;

  } else {

    element.end = implicit_end;
  }

  delete element.explicit_begin;
  delete element.explicit_dur;
  delete element.explicit_end;

  doc._registerEvent(element);

}
